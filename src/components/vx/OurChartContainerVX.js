import React from 'react';
import PropTypes from 'prop-types';
import Typography from '@material-ui/core/Typography';
import { withStyles } from '@material-ui/core/styles';
import OurChartVX from './OurChartVX';
import { valueFormatDisplay, isConsideredMobile } from '../../utils';
import { withParentSize } from '@vx/responsive';

const styles = theme => ({
    outerContainer: {
        display: 'flex',
        position: 'relative',
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
        width: '100%',
        overflow: 'hidden'
    },
    center: {
        flexDirection: 'column',
        display: 'flex',
        position: 'relative',
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%'
    },
    innerContainer: {
        flex: 1,
        display:'flex'
    },
    chart: {
        flexDirection: 'column',
        display:'flex',
        color: 'white',
        borderRadius: '4px',
        width: '100%'
    },
    vxChartTitle: {
        color: 'white',
        fontWeight: '500'
    },
    vxChartSubtitle: {
        color: 'white'
    },
    disclaimer: {
        color: 'black',
        opacity: 0.6
    },
    spacer: {
        flex: 1
    },
    titleBar: {
        display: 'flex',
        flexDirection:'row',
        alignItems: 'center',
        padding: '15px',
    },
    leftTitles: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start'
    },
    rightTitles: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end'
    },
    vxValueGoodChange: {
        color: 'limegreen'
    },
    vxValueBadChange: {
        color: 'red'
    }
});

class OurChartContainerVX extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            hasIncreased: true,
            useConsideredMobile: isConsideredMobile(),
        }
    }
    render() {
        const { classes, margin, areaFillKey, isGoodChart = false, isChangeNeutral = false, primaryValueSubtitle = false, chartTitle, chartSubtitle, chartData, parentWidth, parentHeight, isChartLoading, chartValueLabel, enableCurveStepAfter = false, decimals = 2, isUpGood = false } = this.props;
        let { useConsideredMobile } = this.state;
        let currentValue = 0;
        let diffValue = 0;
        let hasIncreased = true;
        let values = [];
        let percentDiff = 0;

        let useMargin = {
            top: 15,
            bottom: 40,
            left: 0,
            right: 0
        }

        if (margin) {
            useMargin = margin;
        }

        if (chartData && chartData.length  > 0) {
            values = Object.keys(chartData).map(key => {
                return {
                    xAxisValue: chartData[key].xAxisValue,
                    yAxisValue: chartData[key].yAxisValue
                };
            })
            let previousLatestValue = values[values.length - 2].yAxisValue * 1;
            currentValue = values[values.length - 1].yAxisValue * 1;
            percentDiff = ((currentValue * 100) / previousLatestValue) - 100;
            diffValue = currentValue - previousLatestValue;
            hasIncreased = diffValue >= 0;
        }
        return (
            <div className={classes.outerContainer}>
                <div className={classes.center}>
                    <div className={classes.chart + " elevation-shadow-two our-gradient"} style={{ width: '100%', height: '500px' }}>
                        <div className={classes.titleBar}>
                            <div className={classes.leftTitles}>
                                <div>
                                    <Typography className={classes.vxChartTitle + " monospace no-padding-bottom"} variant="h5" component="h2">
                                        {chartTitle}
                                    </Typography>
                                </div>
                                <div>
                                    <Typography className={classes.vxChartSubtitle + " monospace no-padding-top"} component="p">
                                        {chartSubtitle}
                                    </Typography>
                                </div>
                            </div>
                            <div className={classes.spacer}/>
                            <div className={classes.rightTitles}>
                                <div>
                                    <Typography className={classes.vxChartTitle + " monospace no-padding-bottom"} variant="h5" component="h2">
                                        {valueFormatDisplay(currentValue, decimals, chartValueLabel)}
                                    </Typography>
                                </div>
                                <div>
                                    {!primaryValueSubtitle &&
                                        <Typography className={classes.vxChartSubtitle + " monospace no-padding-top " + (!isChangeNeutral && (hasIncreased && isUpGood || (!hasIncreased && !isUpGood) ? classes.vxValueGoodChange : classes.vxValueBadChange))} component="p">
                                            {hasIncreased ? ("+ " + valueFormatDisplay(percentDiff, 2, "%")) : ("- " + valueFormatDisplay(percentDiff * -1, 2, "%"))}
                                        </Typography>
                                    }
                                    {primaryValueSubtitle}
                                </div>
                            </div>
                        </div>
                        <div className={classes.innerContainer}>
                            <OurChartVX isConsideredMobile={useConsideredMobile} areaFillKey={areaFillKey} isGoodChart={isGoodChart} decimals={decimals} enableCurveStepAfter={enableCurveStepAfter} chartValueLabel={chartValueLabel} margin={useMargin} data={values} />
                        </div>
                    </div>
                </div>
                {/* <Typography className={classes.disclaimer} gutterBottom component="p">
                    {chartData.disclaimer}
                </Typography> */}
            </div>
        )
    }
}

OurChartContainerVX.propTypes = {
    classes: PropTypes.object.isRequired,
    theme: PropTypes.object.isRequired,
    margin: PropTypes.object
};
    
export default withParentSize(withStyles(styles, { withTheme: true })(OurChartContainerVX));