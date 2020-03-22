import React, { useState, useEffect, Fragment } from "react";
import { ParentSize } from '@vx/responsive';
import moment from "moment";

import SouthAfrica from "../south-africa-metadata.json";
import OurHorizontalBarChartVX from "./vx/OurHorizontalBarChartVX";
import OurChartContainerVX from "./vx/OurChartContainerVX";
import {isConsideredMobile} from "../utils";

const OurChartCollection = ({confirmedCasesGroupedByDate = [], confirmedCasesHeaderData = []}) => {
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
        for(let dateOfGroup of Object.keys(dateToCollection)) {
            let dateTotal = 0;
            for(let [key, value] of Object.entries(dateToCollection[dateOfGroup])) {
                dateTotal += value;
            }
            newCasesLineChartData.push({xAxisValue: moment(dateOfGroup), yAxisValue: dateTotal});
        }
        setProvinceNewCasesHorizontalChartData(provinceNewCasesHorizontalChartData.reverse());
        setProvinceCumulativeCasesHorizontalChartData(provinceCumulativeCasesHorizontalChartData.reverse());
        setCumulativeCasesLineChartData(cumulativeCasesLineChartData);
        setNewCasesLineChartData(newCasesLineChartData);
    }, [confirmedCasesGroupedByDate, confirmedCasesHeaderData])

    let graphPadding = isConsideredMobile() ? { paddingLeft: '10px', paddingRight: '10px', paddingTop: '25px', paddingBottom: '25px' } : { paddingLeft: '50px', paddingRight: '50px', paddingTop: '25px', paddingBottom: '25px'  }
    return (
        <Fragment>
            <h1 class="white-monospace center-text" style={{paddingTop: '25px'}}>Charts</h1>
            <div style={{...graphPadding}}>
                {cumulativeCasesLineChartData && 
                    <OurChartContainerVX enableCurveStepAfter={false} chartTitle={"Cumulative Coronavirus Infections"} chartSubtitle={"South Africa"} chartData={cumulativeCasesLineChartData} chartValueLabel={"Cases"} />
                }
            </div>
            <div style={{height: '600px'}}>
                {(provinceCumulativeCasesHorizontalChartData && provinceCumulativeCasesHorizontalChartData.length > 0) &&
                    <ParentSize className="graph-container">
                        {({ width: w, height: h }) => {
                            return (
                                <OurHorizontalBarChartVX chartTitle={"Cumulative Cases"} singularLabel={"Cumulative Case"} pluralLabel={"Cumulative Cases"} colorRange={["#4DF21F", "#00F3FF", "#9999FF", "#D82DB9", "#AA1B1B", "#F4E3E3", "#00A57C", "#44FFD1", "#E8E16D"]} data={provinceCumulativeCasesHorizontalChartData} width={w} height={h}/>
                            )
                        }}
                    </ParentSize>
                }
            </div>
            <div style={{...graphPadding, marginTop: '115px'}}>
                {cumulativeCasesLineChartData && 
                    <OurChartContainerVX enableCurveStepAfter={false} chartTitle={"New Coronavirus Infections"} chartSubtitle={"South Africa"} chartData={newCasesLineChartData} chartValueLabel={"New Cases"} />
                }
            </div>
            <div style={{height: '600px'}}>
                {(provinceNewCasesHorizontalChartData && provinceNewCasesHorizontalChartData.length > 0) &&
                    <ParentSize className="graph-container">
                        {({ width: w, height: h }) => {
                            return (
                                <OurHorizontalBarChartVX chartTitle={"New Cases"} singularLabel={"New Case"} pluralLabel={"New Cases"} colorRange={["#4DF21F", "#00F3FF", "#9999FF", "#D82DB9", "#AA1B1B", "#F4E3E3", "#00A57C", "#44FFD1", "#E8E16D"]} data={provinceNewCasesHorizontalChartData} width={w} height={h}/>
                            )
                        }}
                    </ParentSize>
                }
            </div>
            <div style={{height: '150px', position: 'relative'}}>
            </div>
        </Fragment>
    )
}

export default OurChartCollection;