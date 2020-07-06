import React, { Fragment, useState, useEffect } from "react";
import Papa from 'papaparse';
import axios from 'axios';
import styled from 'styled-components';
import Fab from '@material-ui/core/Fab';
import DarkModeIcon from '@material-ui/icons/Brightness3';
import LightModeIcon from '@material-ui/icons/Brightness5';
import BubbleChartIcon from '@material-ui/icons/BubbleChart';
import BorderChartIcon from '@material-ui/icons/GridOn';
import ChartsIcon from '@material-ui/icons/InsertChartOutlined';
import MapIcon from '@material-ui/icons/Map';
import moment from 'moment';

import SouthAfrica from "../south-africa-metadata.json";
import Layout from "../components/layout";
import SEO from "../components/seo";
import OurMap from "../components/OurMap";
import OurChartCollection from "../components/OurChartCollection";
import GitHubLogo from '../images/github.svg';
import { isConsideredMobile } from "../utils";

const SiteControlTopRightContainer = styled.div`
  position: fixed;
  z-index: 600;
  right: 15px;
  margin-top: 15px;
`

const SiteControlBottomLeftContainer = styled.div`
  position: fixed;
  z-index: 600;
  left: 15px;
  bottom: ${props => (props.isMapPage && props.mobile) ? '20px' : '15px'};
  transition: all 0.2s ease-in-out;
`

const IndexPage = () => {
  
  let [totalCases, setTotalCases] = useState(false);
  let [totalRecovered, setTotalRecovered] = useState(false);
  let [totalDead, setTotalDead] = useState(false);
  let [confirmedCasesGroupedByProvince, setConfirmedCasesGroupedByProvince] = useState(false);
  let [confirmedCasesGroupedByDate, setConfirmedCasesGroupedByDate] = useState(false);
  let [prefersLightMode, setPrefersLightMode] = useState((typeof window !== 'undefined' && window.localStorage.getItem("prefersLightMode") === "true") ? true : false);
  let [mapType, setMapType] = useState((typeof window !== 'undefined' && window.localStorage.getItem("mapType")) ? window.localStorage.getItem("mapType") : "choropleth");
  let [nextMapType, setNextMapType] = useState(false);
  let [dataType, setDataType] = useState((typeof window !== 'undefined' && window.localStorage.getItem("dataType")) ? window.localStorage.getItem("dataType") : "map");
  let [nextDataType, setNextDataType] = useState(false);
  let [confirmedCasesHeaderData, setConfirmedCasesHeaderData] = useState(false);
  let [hospitalData, setHospitalData] = useState(false);
  let [testingCasesTimeseries, setTestingCasesTimeseries] = useState(false);
  let [recoveryTimeseries, setRecoveryTimeseries] = useState(false);
  let [deathTimeseries, setDeathTimeseries] = useState(false);
  let [provincialAggregate, setProvincialAggregate] = useState(false);
  let [provincialAggregateTimeline, setProvincialAggregateTimeline] = useState(false);
  let [nationalAggregateTimeseries, setNationalAggregateTimeseries] = useState(false);
  let [nationalActiveAggregateTimeseries, setNationalActiveAggregateTimeseries] = useState(false);

  let mobile = isConsideredMobile();
  let dayBeforeDataSetStart = moment("20200304")

  const getNextMapType = (mapType) => {
    switch(mapType) {
      case "bubble":
        return "choropleth";
      case "choropleth":
        return "bubble";
      default:
        return "bubble";
    }
  }

  const getNextDataType = (dataType) => {
    switch(dataType) {
      case "map":
        return "charts";
      case "charts":
        return "map";
      default:
        return "map";
    }
  }

  const switchToNextMapType = () => {
    setMapType(nextMapType);
    let newNextMapType = getNextMapType(nextMapType);
    setNextMapType(newNextMapType);
    window.localStorage.setItem("mapType", nextMapType);
  }

  const switchToNextDataType = () => {
    setDataType(nextDataType);
    let newNextDataType = getNextDataType(nextDataType);
    setNextDataType(newNextDataType);
    window.localStorage.setItem("dataType", nextDataType);
  }

  const savePrefersLightMode = (prefersLightMode) => {
    window.localStorage.setItem("prefersLightMode", prefersLightMode);
    setPrefersLightMode(prefersLightMode);
  }

  useEffect(() => {
    axios.all([
      axios.get(`https://raw.githubusercontent.com/dsfsi/covid19za/master/data/covid19za_timeline_confirmed.csv`),
      axios.get(`https://raw.githubusercontent.com/dsfsi/covid19za/master/data/covid19za_timeline_testing.csv`),
      // axios.get(`https://raw.githubusercontent.com/JayWelsh/covid19za/master/data/covid19za_provincial_cumulative_timeline_confirmed.csv`),
      axios.get(`https://raw.githubusercontent.com/dsfsi/covid19za/master/data/covid19za_provincial_cumulative_timeline_confirmed.csv`),
      // axios.get(`https://raw.githubusercontent.com/dsfsi/covid19za/master/data/health_system_za_public_hospitals.csv`)
    ]).then(res => {
      let { data: confirmedCasesData } = res[0];
      let { data: testingData } = res[1];
      let { data: provincialAggregateData } = res[2];
      // let { data: hospitalLocationData } = res[2];

      let testingCasesInstance = Papa.parse(testingData);
      let parsedTestingCasesData = testingCasesInstance.data;

      let testingCasesIndexOfDate = parsedTestingCasesData[0].indexOf("YYYYMMDD");
      let testingCasesIndexOfCumulativeCount = parsedTestingCasesData[0].indexOf("cumulative_tests");
      let testingCasesIndexOfRecovered = parsedTestingCasesData[0].indexOf("recovered");
      let testingCasesIndexOfDeaths = parsedTestingCasesData[0].indexOf("deaths");
      let useTestingCasesTimeseries = [];
      let dateToTotalRecovered = {};
      let dateToTotalDeaths = {};
      let useRecoveryTimeseries = [
        {xAxisValue: moment("20200304"), yAxisValue: 0},
        {xAxisValue: moment("20200305"), yAxisValue: 0},
      ];
      let useDeathTimeseries = [
        {xAxisValue: moment("20200304"), yAxisValue: 0},
        {xAxisValue: moment("20200305"), yAxisValue: 0},
      ];
      for (let i = 1; i < parsedTestingCasesData.length; i++) {
        if (
          parsedTestingCasesData[i][testingCasesIndexOfDate] &&
          parsedTestingCasesData[i][testingCasesIndexOfCumulativeCount]
        ) {
          let date = parsedTestingCasesData[i][testingCasesIndexOfDate];
          let cumulation = parsedTestingCasesData[i][testingCasesIndexOfCumulativeCount];
          useTestingCasesTimeseries.push({xAxisValue: moment(date), yAxisValue: cumulation});
        }
        if (
          parsedTestingCasesData[i][testingCasesIndexOfRecovered]
        ) {
          let date = parsedTestingCasesData[i][testingCasesIndexOfDate];
          let cumulation = parsedTestingCasesData[i][testingCasesIndexOfRecovered];
          if(moment(date).isAfter("20200305")){
            useRecoveryTimeseries.push({xAxisValue: moment(date), yAxisValue: cumulation});
            dateToTotalRecovered[moment(date).format("YYYYMMDD")] = cumulation;
          }
        }
        if (
          parsedTestingCasesData[i][testingCasesIndexOfDeaths]
        ) {
          let date = parsedTestingCasesData[i][testingCasesIndexOfDate];
          let cumulation = parsedTestingCasesData[i][testingCasesIndexOfDeaths];
          if(moment(date).isAfter("20200305")){
            useDeathTimeseries.push({xAxisValue: moment(date), yAxisValue: cumulation});
            dateToTotalDeaths[moment(date).format("YYYYMMDD")] = cumulation;
          }
        }
      }

      if(useRecoveryTimeseries.length > 0) {
        let currentTotalRecoveries = useRecoveryTimeseries[useRecoveryTimeseries.length - 1].yAxisValue * 1;
        setTotalRecovered(currentTotalRecoveries);
      }

      if(useDeathTimeseries.length > 0){
        let currentTotalDeaths = useDeathTimeseries[useDeathTimeseries.length - 1].yAxisValue * 1;
        setTotalDead(currentTotalDeaths);
      }

      let provincialAggregateCasesInstance = Papa.parse(provincialAggregateData);
      let parsedProvincialAggregateData = provincialAggregateCasesInstance.data;

      let provincialAggregateIndexOfDate = parsedProvincialAggregateData[0].indexOf("YYYYMMDD");
      let provincialAggregateIndexOfUnknown = parsedProvincialAggregateData[0].indexOf("UNKNOWN");
      let provincialAggregateIndexOfTotal = parsedProvincialAggregateData[0].indexOf("total");

      //Patch any missing provincial data days with data from prior day
      for (let i = 1; i < parsedProvincialAggregateData.length; i++) {
        if (
          parsedProvincialAggregateData[i][provincialAggregateIndexOfDate]
        ) {
          let tripwire = false;
          let provinceKeys = Object.keys(SouthAfrica.provinces);
          for(let provinceKey of provinceKeys){
            let indexOfProvince = parsedProvincialAggregateData[0].indexOf(provinceKey);
            if(indexOfProvince > -1){
              if(parsedProvincialAggregateData[i][indexOfProvince] !== ""){
                tripwire = true;
              }
            }
          }
          if(!tripwire) {
            for(let provinceKey of provinceKeys){
              let indexOfProvince = parsedProvincialAggregateData[0].indexOf(provinceKey);
              if(indexOfProvince > -1){
                parsedProvincialAggregateData[i][indexOfProvince] = parsedProvincialAggregateData[i - 1][indexOfProvince]
              }
            }
            parsedProvincialAggregateData[i][provincialAggregateIndexOfUnknown] = ((parsedProvincialAggregateData[i - 1][provincialAggregateIndexOfUnknown] * 1) + ((parsedProvincialAggregateData[i][provincialAggregateIndexOfTotal] * 1) - (parsedProvincialAggregateData[i - 1][provincialAggregateIndexOfTotal] * 1))).toString()
          }
        }
      }

      let useNationalAggregateTimeseries = [{xAxisValue: dayBeforeDataSetStart, yAxisValue: 0}];
      let useNationalActiveAggregateTimeseries = [{xAxisValue: dayBeforeDataSetStart, yAxisValue: 0}];
      let useProvincialAggregateTimeline = [];
      let useProvincialAggregate = {};
      let currentTotalCases = 0;
      for (let i = 1; i < parsedProvincialAggregateData.length; i++) {
        let date = parsedProvincialAggregateData[i][provincialAggregateIndexOfDate];
        if (
          parsedProvincialAggregateData[i][provincialAggregateIndexOfDate]
        ) {
          let runningTotal = 0;
          let provinceToRunningTotal = {};
          for(let provinceKey of Object.keys(SouthAfrica.provinces)){
            let indexOfProvince = parsedProvincialAggregateData[0].indexOf(provinceKey);
            if(indexOfProvince > -1){
              runningTotal += parsedProvincialAggregateData[i][indexOfProvince] * 1;
              if(!provinceToRunningTotal[provinceKey]) {
                provinceToRunningTotal[provinceKey] = parsedProvincialAggregateData[i][indexOfProvince] * 1;
              }else{
                provinceToRunningTotal[provinceKey] = provinceToRunningTotal[provinceKey] + parsedProvincialAggregateData[i][indexOfProvince];
              }
            }
          }
          if(parsedProvincialAggregateData[i][provincialAggregateIndexOfUnknown]) {
            provinceToRunningTotal["UNKNOWN"] = parsedProvincialAggregateData[i][provincialAggregateIndexOfUnknown];
            runningTotal += parsedProvincialAggregateData[i][provincialAggregateIndexOfUnknown] * 1;
          }

          let runningTotalActive = runningTotal;
          if(dateToTotalRecovered[date]){
            runningTotalActive = runningTotal - dateToTotalRecovered[date];
          }
          if(dateToTotalDeaths[date]) {
            runningTotalActive = runningTotalActive - dateToTotalDeaths[date];
          }

          useProvincialAggregateTimeline.push({date: date,...provinceToRunningTotal});
          useNationalAggregateTimeseries.push({xAxisValue: moment(date), yAxisValue: runningTotal});
          useNationalActiveAggregateTimeseries.push({xAxisValue: moment(date), yAxisValue: runningTotalActive});
          useProvincialAggregate = provinceToRunningTotal;
          currentTotalCases = runningTotal;
        }
      }

      let parsedConfirmedCasesInstance = Papa.parse(confirmedCasesData);
      let parsedConfirmedCasesData = parsedConfirmedCasesInstance.data;

      let confirmedCasesHeaderRow = parsedConfirmedCasesData[0];
      let confirmedCasesIndexOfProvince = confirmedCasesHeaderRow.indexOf("province");
      let confirmedCasesIndexOfDate = confirmedCasesHeaderRow.indexOf("YYYYMMDD");
      let confirmedCasesGroupedByProvince = {};
      let confirmedCasesGroupedByDate = {};
      // let confirmedCasesGroupedByAge = {};

      for (let i = 1; i < parsedConfirmedCasesData.length; i++) {
        if (
          parsedConfirmedCasesData[i][confirmedCasesIndexOfProvince] &&
          parsedConfirmedCasesData[i][confirmedCasesIndexOfDate]
        ) {
          let provinceName = parsedConfirmedCasesData[i][confirmedCasesIndexOfProvince];
          let date = parsedConfirmedCasesData[i][confirmedCasesIndexOfDate];
          if (confirmedCasesGroupedByProvince[provinceName]) {
            confirmedCasesGroupedByProvince[provinceName].push(parsedConfirmedCasesData[i]);
          } else {
            confirmedCasesGroupedByProvince[provinceName] = [parsedConfirmedCasesData[i]];
          }
          if (confirmedCasesGroupedByDate[date]) {
            confirmedCasesGroupedByDate[date].push(parsedConfirmedCasesData[i]);
          } else {
            confirmedCasesGroupedByDate[date] = [parsedConfirmedCasesData[i]];
          }
        }
      }

      // let parsedHospitalLocationInstance = Papa.parse(hospitalLocationData);
      // let parsedHospitalLocationData = parsedHospitalLocationInstance.data;

      // let hospitalData = [];
      // let hospitalDataIndexOfName = parsedHospitalLocationData[0].indexOf("Name");
      // let hospitalDataIndexOfLongitude = parsedHospitalLocationData[0].indexOf("Long");
      // let hospitalDataIndexOfLatitude = parsedHospitalLocationData[0].indexOf("Lat");
      // for(let hospitalEntry of parsedHospitalLocationData) {
      //   if(
      //       hospitalEntry[hospitalDataIndexOfName] &&
      //       hospitalEntry[hospitalDataIndexOfName] !== "Name" &&
      //       hospitalEntry[hospitalDataIndexOfLongitude] &&
      //       hospitalEntry[hospitalDataIndexOfLatitude] &&
      //       !isNaN(hospitalEntry[hospitalDataIndexOfLatitude] * 1) &&
      //       !isNaN(hospitalEntry[hospitalDataIndexOfLongitude] * 1)
      //     ) {
      //       hospitalData.push({name: hospitalEntry[hospitalDataIndexOfName], position: [hospitalEntry[hospitalDataIndexOfLatitude] * 1, hospitalEntry[hospitalDataIndexOfLongitude] * 1]})
      //     }
      // }

      setNationalAggregateTimeseries(useNationalAggregateTimeseries);
      setNationalActiveAggregateTimeseries(useNationalActiveAggregateTimeseries);
      setProvincialAggregateTimeline(useProvincialAggregateTimeline);
      setProvincialAggregate(useProvincialAggregate);
      setConfirmedCasesHeaderData(confirmedCasesHeaderRow);
      setConfirmedCasesGroupedByProvince(confirmedCasesGroupedByProvince);
      setConfirmedCasesGroupedByDate(confirmedCasesGroupedByDate);
      setTestingCasesTimeseries(useTestingCasesTimeseries);
      setRecoveryTimeseries(useRecoveryTimeseries);
      setDeathTimeseries(useDeathTimeseries);
      // setHospitalData(hospitalData);
      setTotalCases(currentTotalCases);
      
      let dataType = (typeof window !== 'undefined' && window.localStorage.getItem("dataType")) ? window.localStorage.getItem("dataType") : "map";
      let nextDataType = getNextDataType(dataType);
      setNextDataType(nextDataType);

      let mapType = (typeof window !== 'undefined' && window.localStorage.getItem("mapType")) ? window.localStorage.getItem("mapType") : "choropleth";
      let nextMapType = getNextMapType(mapType);
      setNextMapType(nextMapType)
    })
  }, [])

  return (
    <Layout totalCases={totalCases} totalRecovered={totalRecovered} totalDead={totalDead}>
      <SEO title="Home" />
      {totalCases && 
        <SiteControlTopRightContainer>
          <div className="flex-column">
              <Fab style={{marginBottom: '15px'}} onClick={() => switchToNextDataType()} aria-label="add">
                  {dataType === "map" &&
                    <ChartsIcon />
                  }
                  {dataType === "charts" &&
                    <MapIcon />
                  }
              </Fab>
              {dataType === "map" &&
                <Fragment>
                  <Fab style={{marginBottom: '15px'}} onClick={() => switchToNextMapType()} aria-label="add">
                    {mapType === "bubble" &&
                      <BorderChartIcon />
                    }
                    {mapType === "choropleth" &&
                      <BubbleChartIcon />
                    }
                  </Fab>
                  <Fab style={{marginBottom: '15px'}} onClick={() => savePrefersLightMode(!prefersLightMode)} aria-label="add">
                    {prefersLightMode ? <DarkModeIcon /> : <LightModeIcon />}
                  </Fab>
                </Fragment>
              }
          </div>
        </SiteControlTopRightContainer>
      }
      {dataType === "map" && totalCases &&
        <SiteControlBottomLeftContainer mobile={mobile} isMapPage={dataType === "map" ? true : false}>
          <a target="_blank" rel="noopener noreferrer" href="https://github.com/JayWelsh/coronamap">
              <Fab aria-label="add">
                  <GitHubLogo/>
              </Fab>
          </a>
        </SiteControlBottomLeftContainer>
      }
      {(confirmedCasesGroupedByDate && confirmedCasesHeaderData && dataType === "charts") && <OurChartCollection deathTimeseries={deathTimeseries} recoveryTimeseries={recoveryTimeseries} nationalAggregateTimeseries={nationalAggregateTimeseries} nationalActiveAggregateTimeseries={nationalActiveAggregateTimeseries} nationalActiveAggregateTimeseries={nationalActiveAggregateTimeseries} provincialAggregateTimeline={provincialAggregateTimeline} testingCasesTimeseries={testingCasesTimeseries} confirmedCasesHeaderData={confirmedCasesHeaderData} confirmedCasesGroupedByDate={confirmedCasesGroupedByDate}/>}
      {(confirmedCasesGroupedByProvince && dataType === "map") && <OurMap mapType={mapType} prefersLightMode={prefersLightMode} hospitalData={hospitalData} provincialAggregate={provincialAggregate}/>}
    </Layout>
  )
}

export default IndexPage
