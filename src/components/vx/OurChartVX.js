import React from 'react';
import { withParentSize } from '@vx/responsive'
import { scaleTime, scaleLinear } from '@vx/scale';
import { LinePath, AreaClosed, Bar, Line } from '@vx/shape';
import { LinearGradient } from '@vx/gradient';
import { PatternLines } from '@vx/pattern';
import { withTooltip, Tooltip } from '@vx/tooltip';
import {localPoint} from '@vx/event';
import { AxisBottom } from '@vx/axis';
import { bisector } from 'd3-array';
import { timeFormat } from 'd3-time-format';
import { valueFormatDisplay } from '../../utils';
import { curveStepAfter, curveLinear } from '@vx/curve'

const bisectDate = bisector(d => xData(d)).left
const xData = dataObject => new Date(dataObject.xAxisValue);
//const x = dataObject => dataObject.xAxisValue;
const y = dataObject => dataObject.yAxisValue;
class OurChartVX extends React.Component {
    constructor(props) {
        super(props);
        this.handleTooltip = this.handleTooltip.bind(this);
        this.state = {
            shiftTooltipLeft: false,
            shiftTooltipRight: false
        }
    }
    handleTooltip({ event, data, xData, xScale, yScale }) {
        const { showTooltip } = this.props;
        const { x: xPoint } = localPoint(this.svg, event);
        const x0 = xScale.invert(xPoint);
        const index = bisectDate(data, x0, 1);
        const d0 = data[index - 1];
        const d1 = data[index];
        if(d0 && d1) {
            const d = xScale(x0) - xScale(xData(d0)) > xScale(xData(d1)) - xScale(x0) ? d1 : d0;
            const totalGraphWidth = xScale(xData(data[data.length - 1]));
            let tooltipLeft = xScale(xData(d));
            if((totalGraphWidth - tooltipLeft) < 100){
                this.setState({shiftTooltipLeft: true});
            }else{
                this.setState({shiftTooltipLeft: false});
            }
            if(tooltipLeft < 100){
                this.setState({shiftTooltipRight: true});
            }else{
                this.setState({shiftTooltipRight: false});
            }
            showTooltip({
                tooltipLeft: tooltipLeft,
                tooltipTop: yScale(y(d)),
                tooltipData: d
            });
        }
    }

    render() {
        const { data, parentWidth, parentHeight, margin, tooltipLeft, tooltipTop, tooltipData, hideTooltip, isConsideredMobile, chartValueLabel, enableCurveStepAfter} = this.props;
        const {shiftTooltipLeft, shiftTooltipRight} = this.state;

        const width = parentWidth - margin.left - margin.right;
        const height = parentHeight - margin.top - margin.bottom;
        const tooltipAnimation = 'all .25s cubic-bezier(.42,.2,.5,1)';

        let tooltipValueTranslate = 'translateX(0%)';
        let tooltipDateTranslate = 'translateX(-50%)';
        
        if(shiftTooltipLeft) {
            tooltipValueTranslate = 'translateX(calc(-100% - 25px))';
            tooltipDateTranslate = 'translateX(-100%)';
        } else if (shiftTooltipRight) {
            tooltipDateTranslate = 'translateX(0%)';
        }

    
        if (data.length > 0) {
        
            const xAxisTickFunction = (val, i) => ({ fontSize: 14, fill: 'white' })

            //const xAxisTickFormat = (val, i) => formatDateTimeTicker(val);
            const xAxisTickFormat = (val, i) => formatDateTimeTicker(val);

            const firstPointX = data[0];
            const currentPointX = data[data.length - 1];

            const maxValue = Math.max(...data.map(y));
            const minValue = Math.min(...data.map(y));

            const maxTime = Math.max(...data.map(xData));
            const minTime = Math.min(...data.map(xData));

            let formatDateTimeTooltip = timeFormat("%d %b %Y  |  %I:%M %p")
            
            let formatDateTimeTicker = timeFormat("%d %b %Y")

            const numTicks = isConsideredMobile ? 3 : 4

            const maxValuesData = [
                {
                    xAxisValue: xData(firstPointX),
                    yAxisValue: maxValue
                }, {
                    xAxisValue: xData(currentPointX),
                    yAxisValue: maxValue
                }
            ]

            const minValuesData = [
                {
                    xAxisValue: xData(firstPointX),
                    yAxisValue: minValue
                }, {
                    xAxisValue: xData(currentPointX),
                    yAxisValue: minValue
                }
            ]

            const xScale = scaleTime({
                range: [0, width],
                domain: [minTime, maxTime]
            });

            const yScale = scaleLinear({
                range: [height, 0],
                domain: [minValue, maxValue]
            });

            const maxTooltipTop = yScale(minValue)
            const setTooltipLabelTop = ((maxTooltipTop - tooltipTop) > 20) ? tooltipTop - 12 : maxTooltipTop - 32;

            return (
                <div>
                    <svg className={"monospace"} style={{overflow: 'visible'}} ref={s => (this.svg = s)} width={width} height={height + 30}>
                        <AxisBottom
                            tickLabelProps={xAxisTickFunction}
                            tickFormat={xAxisTickFormat}
                            top={yScale(minValue)}
                            data={data}
                            scale={xScale}
                            x={xData}
                            hideAxisLine
                            hideTicks
                            numTicks={numTicks}
                            className={"monospace"}
                        />
                        <LinearGradient id='area-fill' from="#424242" to="#0d0b14" fromOpacity={1} toOpacity={0} />
                        <PatternLines
                            id="dLines"
                            height={6}
                            width={6}
                            stroke="#0d0b14"
                            strokeWidth={1}
                            orientation={['diagonal']}
                            fromOpacity={1}
                            toOpacity={0}
                        />
                        
                        <AreaClosed
                            data={data}
                            yScale={yScale}
                            x={d => xScale(xData(d))}
                            curve={enableCurveStepAfter ? curveStepAfter : curveLinear}
                            y={d => yScale(y(d))}
                            fill="url(#area-fill)"
                            stroke="transparent" />
                        <AreaClosed
                            stroke="transparent"
                            data={data}
                            yScale={yScale}
                            curve={enableCurveStepAfter ? curveStepAfter : curveLinear}
                            y={d => yScale(y(d))}
                            x={d => xScale(xData(d))}
                            fill="url(#dLines)"
                        />
                        <LinePath curve={enableCurveStepAfter ? curveStepAfter : curveLinear} stroke={"#9f9f9f"} data={data} y={d => yScale(y(d))} x={d => xScale(xData(d))} />
                        <g>
                            <LinePath
                                data={maxValuesData}
                                x={d => xScale(xData(d))}
                                y={d => yScale(y(d))}
                                strokeDasharray="4,4"
                                stroke={"#424242"}
                            />
                            <text className={"monospace"} y={yScale(maxValue)} fill="white" dy="1.3em" dx="1em" fontSize="14">
                                {valueFormatDisplay(maxValue , 2, chartValueLabel)}
                            </text>
                        </g>
                        <g>
                            <LinePath
                                data={minValuesData}
                                x={d => xScale(xData(d))}
                                y={d => yScale(y(d))}
                                strokeDasharray="4,4"
                                stroke={"#424242"}
                            />
                            <text className={"monospace"} y={yScale(minValue)} dy="-.5em" fill="white" dx="1em" fontSize="14">
                                {valueFormatDisplay(minValue, 2, chartValueLabel)}
                            </text>
                        </g>
                        <Bar
                            data={data}
                            width={width}
                            height={height}
                            fill="transparent"
                            onMouseMove={event =>
                                this.handleTooltip({
                                  event,
                                  xData,
                                  xScale,
                                  yScale,
                                  data: data
                                })
                              }
                            onTouchStart={event =>
                                this.handleTooltip({
                                  event,
                                  xData,
                                  xScale,
                                  yScale,
                                  data: data
                                })
                              }
                              onTouchMove={event =>
                                this.handleTooltip({
                                  event,
                                  xData,
                                  xScale,
                                  yScale,
                                  data: data
                                })
                              }
                            onMouseLeave={data => event => hideTooltip()}
                            onTouchEnd={data => event => hideTooltip()}
                        />
                        {tooltipData && <g>
                            <Line
                                from={{x: tooltipLeft, y: yScale(y(maxValuesData[0]))}}
                                to={{x: tooltipLeft, y: yScale(y(minValuesData[0]))}}
                                stroke="white"
                                strokeDasharray="3,3"
                                style={{pointerEvents: 'none'}}
                            />
                            <circle
                                r="8"
                                cx={tooltipLeft}
                                cy={tooltipTop}
                                fill="#f50057"
                                fillOpacity={0.4}
                                style={{pointerEvents: 'none'}}
                            />
                            <circle
                                r="4"
                                cx={tooltipLeft}
                                cy={tooltipTop}
                                fill="#f50057"
                                style={{pointerEvents: 'none'}}
                            />
                        </g>}
                    </svg>
                    {tooltipData &&
                            <div>
                            <Tooltip top={setTooltipLabelTop} left={tooltipLeft + 12} style={{backgroundColor: '#272727', color: '#FFFFFF', pointerEvents: 'none', transform: tooltipValueTranslate, transition: tooltipAnimation, whiteSpace: 'pre', boxShadow: '0px 5px 5px -3px rgba(0,0,0,0.2), 0px 8px 10px 1px rgba(0,0,0,0.14), 0px 3px 14px 2px rgba(0,0,0,0.12)'}}>
                                <b className={"monospace"}>{valueFormatDisplay(y(tooltipData), 2, chartValueLabel)}</b>
                            </Tooltip>
                            <Tooltip top={yScale(minValue)} left={tooltipLeft} style={{backgroundColor: '#272727', color: '#FFFFFF', transform: tooltipDateTranslate, pointerEvents: 'none', display: 'table', transition: tooltipAnimation, whiteSpace: 'pre', boxShadow: '0px 5px 5px -3px rgba(0,0,0,0.2), 0px 8px 10px 1px rgba(0,0,0,0.14), 0px 3px 14px 2px rgba(0,0,0,0.12)'}}>
                                <b className={"monospace"}>{formatDateTimeTooltip(xData(tooltipData))}</b>
                            </Tooltip>
                            </div>
                        }
                </div>
            );
        } else {
            return (
                <div width={width} height={parentHeight}>

                </div>
            )
        }
    }
}

export default withParentSize(withTooltip(OurChartVX));