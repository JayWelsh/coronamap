import React, { useState, useEffect, Fragment } from "react";
import { ParentSize } from '@vx/responsive';
import moment from "moment";

import SouthAfrica from "../south-africa-metadata.json";
import OurHorizontalBarChartVX from "./vx/OurHorizontalBarChartVX";
import OurChartContainerVX from "./vx/OurChartContainerVX";
import {isConsideredMobile} from "../utils";

const OurChartCollection = ({
    confirmedCasesGroupedByDate = [],
    confirmedCasesHeaderData = [],
    testingCasesTimeseries = [],
    recoveryTimeseries = [],
    deathTimeseries = [],
    nationalAggregateTimeseries = [],
    nationalActiveAggregateTimeseries = [],
    provincialAggregateTimeline = [],
}) => {
    const [provinceNewCasesHorizontalChartData, setProvinceNewCasesHorizontalChartData] = useState(false);
    const [provinceCumulativeCasesHorizontalChartData, setProvinceCumulativeCasesHorizontalChartData] = useState(false);
    const [newCasesLineChartData, setNewCasesLineChartData] = useState(false);
    const [cumulativeCasesLineChartData, setCumulativeCasesLineChartData] = useState(false);

    useEffect(() => {
        let indexOfProvince = confirmedCasesHeaderData.indexOf("province");
        let dateToCollection = {};
        let provincesInData = [];
        let provinceCumulativeCount = {};
        let datedProvinceCumulativeCounts = {};
        let dayBeforeDataSetStart = moment("20200304")
        for(let dateOfGroup of Object.keys(confirmedCasesGroupedByDate)) {
            for(let confirmedCase of confirmedCasesGroupedByDate[dateOfGroup]) {
                if(SouthAfrica.provinces[confirmedCase[indexOfProvince]]){
                    let province = SouthAfrica.provinces[confirmedCase[indexOfProvince]].name;
                    if(provincesInData.indexOf(province) === -1) {
                        provincesInData.push(province);
                    }
                    if(!provinceCumulativeCount[province]) {
                        provinceCumulativeCount[province] = 1;
                    }else{
                        provinceCumulativeCount[province] = provinceCumulativeCount[province] + 1;
                    }
                    if(!dateToCollection[dateOfGroup]) {
                        dateToCollection[dateOfGroup] = {};
                        dateToCollection[dateOfGroup][province] = 1;
                    } else {
                        if(dateToCollection[dateOfGroup][province]) {
                            dateToCollection[dateOfGroup][province] = dateToCollection[dateOfGroup][province] + 1;
                        }else{
                            dateToCollection[dateOfGroup][province] = 1;
                        }
                    }
                }
            }
            datedProvinceCumulativeCounts[dateOfGroup] = {...provinceCumulativeCount};
        }
        let cumulativeCasesLineChartData = [{xAxisValue: dayBeforeDataSetStart, yAxisValue: 0}];
        for(let dateOfGroup of Object.keys(datedProvinceCumulativeCounts)) {
            let dateTotal = 0;
            for(let [key, value] of Object.entries(datedProvinceCumulativeCounts[dateOfGroup])) {
                dateTotal += value;
            }
            cumulativeCasesLineChartData.push({xAxisValue: moment(dateOfGroup), yAxisValue: dateTotal});
        }
        let provinceNewCasesHorizontalChartData = [];
        let provinceCumulativeCasesHorizontalChartData = [];
        for(let dateOfProvinceCases of Object.keys(dateToCollection)){
            let provinceNewCaseCountsAsStrings = {};
            for(let provinceKey of Object.keys(dateToCollection[dateOfProvinceCases])){
                provinceNewCaseCountsAsStrings[provinceKey] = dateToCollection[dateOfProvinceCases][provinceKey].toString();
            }
            for(let patchProvince of provincesInData) {
                if(!provinceNewCaseCountsAsStrings[patchProvince]) {
                    provinceNewCaseCountsAsStrings[patchProvince] = "0";
                }
                if(!datedProvinceCumulativeCounts[dateOfProvinceCases][patchProvince]){
                    datedProvinceCumulativeCounts[dateOfProvinceCases][patchProvince] = 0;
                }
            }
            provinceNewCasesHorizontalChartData.push({date: dateOfProvinceCases, ...provinceNewCaseCountsAsStrings});
            provinceCumulativeCasesHorizontalChartData.push({date: dateOfProvinceCases, ...datedProvinceCumulativeCounts[dateOfProvinceCases]})
        }
        let newCasesLineChartData = [{xAxisValue: dayBeforeDataSetStart, yAxisValue: 0}];
        nationalAggregateTimeseries.forEach((item, index) => {
            let dateTotal = 0;
            if(nationalAggregateTimeseries[index - 1] && nationalAggregateTimeseries[index - 1].yAxisValue) {
                dateTotal = nationalAggregateTimeseries[index].yAxisValue - nationalAggregateTimeseries[index - 1].yAxisValue;
            }
            newCasesLineChartData.push({xAxisValue: item.xAxisValue, yAxisValue: dateTotal});
        })
        let overrideHorizontalCumulativeCases = [];
        let overrideNewCasesHorizontalChartData = [];
        for(let [index, item] of provincialAggregateTimeline.entries()) {
            for(let timelineItemKey of Object.keys(item)) {
                if(timelineItemKey !== "date"){
                    let useProvinceName = "Unknown";
                    if(SouthAfrica.provinces[timelineItemKey]){
                        useProvinceName = SouthAfrica.provinces[timelineItemKey].name;
                    }
                    if(!overrideHorizontalCumulativeCases[index]) {
                        overrideHorizontalCumulativeCases[index] = {};
                    }
                    if(!overrideNewCasesHorizontalChartData[index]) {
                        overrideNewCasesHorizontalChartData[index] = {};
                    }
                    overrideHorizontalCumulativeCases[index][useProvinceName] = item[timelineItemKey];
                    if(provincialAggregateTimeline[index - 1] && provincialAggregateTimeline[index - 1][timelineItemKey]){
                        overrideNewCasesHorizontalChartData[index][useProvinceName] = item[timelineItemKey] - provincialAggregateTimeline[index - 1][timelineItemKey];
                    }else{
                        overrideNewCasesHorizontalChartData[index][useProvinceName]= item[timelineItemKey];
                    }
                }else{
                    if(!overrideHorizontalCumulativeCases[index]) {
                        overrideHorizontalCumulativeCases[index] = {};
                    }
                    overrideHorizontalCumulativeCases[index][timelineItemKey] = item[timelineItemKey];
                    if(!overrideNewCasesHorizontalChartData[index]) {
                        overrideNewCasesHorizontalChartData[index] = {};
                    }
                    overrideNewCasesHorizontalChartData[index][timelineItemKey] = item[timelineItemKey];
                }
            }
        }
        setProvinceNewCasesHorizontalChartData(overrideNewCasesHorizontalChartData.reverse());
        setProvinceCumulativeCasesHorizontalChartData(overrideHorizontalCumulativeCases.reverse());
        setCumulativeCasesLineChartData(cumulativeCasesLineChartData);
        setNewCasesLineChartData(newCasesLineChartData);
    }, [confirmedCasesGroupedByDate, confirmedCasesHeaderData, testingCasesTimeseries])

    let graphPadding = isConsideredMobile() ? { paddingLeft: '10px', paddingRight: '10px', paddingTop: '25px', paddingBottom: '25px' } : { paddingLeft: '50px', paddingRight: '50px', paddingTop: '25px', paddingBottom: '25px'  }
    return (
        <Fragment>
            <h1 className="white-monospace center-text" style={{paddingTop: '25px'}}>Charts</h1>
            <div style={{...graphPadding}}>
                {nationalActiveAggregateTimeseries && 
                    <OurChartContainerVX decimals={0} areaFillKey={"active-cases-cumulative-linechart"} isUpGood={false} enableCurveStepAfter={false} chartTitle={"Active Cases"} chartSubtitle={"South Africa"} chartData={nationalActiveAggregateTimeseries} chartValueLabel={"Cases"} />
                }
            </div>
            <div style={{...graphPadding, marginTop: '35px'}}>
                {nationalAggregateTimeseries && 
                    <OurChartContainerVX decimals={0} areaFillKey={"cases-cumulative-linechart"} isUpGood={false} enableCurveStepAfter={false} chartTitle={"Cumulative Cases"} chartSubtitle={"South Africa"} chartData={nationalAggregateTimeseries} chartValueLabel={"Cases"} />
                }
            </div>
            <div style={{height: '1200px'}}>
                {(provinceCumulativeCasesHorizontalChartData && provinceCumulativeCasesHorizontalChartData.length > 0) &&
                    <ParentSize className="graph-container">
                        {({ width: w, height: h }) => {
                            return (
                                <OurHorizontalBarChartVX chartTitle={"Cumulative Cases"} singularLabel={"Cumulative Case"} pluralLabel={"Cumulative Cases"} colorRange={["#4DF21F", "#00F3FF", "#9999FF", "#D82DB9", "#AA1B1B", "#F4E3E3", "#FF5200", "#44FFD1", "#E8E16D", "#00A57C"]} data={provinceCumulativeCasesHorizontalChartData} width={w} height={h}/>
                            )
                        }}
                    </ParentSize>
                }
            </div>
            <div style={{...graphPadding, marginTop: '115px'}}>
                {newCasesLineChartData && 
                    <OurChartContainerVX decimals={0} areaFillKey={"cases-new-linechart"} isChangeNeutral={false} enableCurveStepAfter={false} chartTitle={"New Cases Per Day"} chartSubtitle={"South Africa"} chartData={newCasesLineChartData} chartValueLabel={"New"} />
                }
            </div>
            <div style={{height: '1200px'}}>
                {(provinceNewCasesHorizontalChartData && provinceNewCasesHorizontalChartData.length > 0) &&
                    <ParentSize className="graph-container">
                        {({ width: w, height: h }) => {
                            return (
                                <OurHorizontalBarChartVX chartTitle={"New Cases Per Day"} singularLabel={"New Case"} pluralLabel={"New Cases"} colorRange={["#4DF21F", "#00F3FF", "#9999FF", "#D82DB9", "#AA1B1B", "#F4E3E3", "#FF5200", "#44FFD1", "#E8E16D", "#00A57C"]} data={provinceNewCasesHorizontalChartData} width={w} height={h}/>
                            )
                        }}
                    </ParentSize>
                }
            </div>
            <div style={{...graphPadding, marginTop: '115px'}}>
                {recoveryTimeseries && 
                    <OurChartContainerVX areaFillKey={"recovery-cumulative-linechart"} isGoodChart={true} isUpGood={true} decimals={0} enableCurveStepAfter={false} chartTitle={"Cumulative Recoveries"} chartSubtitle={"South Africa"} chartData={recoveryTimeseries} chartValueLabel={"Recoveries"} />
                }
            </div>
            <div style={{...graphPadding, marginTop: '35px'}}>
                {deathTimeseries && 
                    <OurChartContainerVX areaFillKey={"deaths-cumulative-linechart"} decimals={0} enableCurveStepAfter={false} chartTitle={"Cumulative Deaths"} chartSubtitle={"South Africa"} chartData={deathTimeseries} chartValueLabel={"Deaths"} />
                }
            </div>
            <div style={{...graphPadding, marginTop: '35px'}}>
                {testingCasesTimeseries && 
                    <OurChartContainerVX areaFillKey={"testing-cumulative-linechart"} isGoodChart={true} isUpGood={true} decimals={0} enableCurveStepAfter={false} chartTitle={"Cumulative Testing"} chartSubtitle={"South Africa"} chartData={testingCasesTimeseries} chartValueLabel={"Tests"} />
                }
            </div>
            <div style={{height: '50px', position: 'relative'}}>
            </div>
        </Fragment>
    )
}

export default OurChartCollection;