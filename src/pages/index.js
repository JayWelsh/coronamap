import React, { Fragment, useState, useEffect } from "react";
import Papa from 'papaparse';
import axios from 'axios';
import styled from 'styled-components';
import Fab from '@material-ui/core/Fab';
import DarkModeIcon from '@material-ui/icons/Brightness3';
import LightModeIcon from '@material-ui/icons/Brightness5';
import BubbleChartIcon from '@material-ui/icons/BubbleChart';
import BorderChartIcon from '@material-ui/icons/GridOn';
import ChartsIcon from '@material-ui/icons/Timeline';
import MapIcon from '@material-ui/icons/Map';

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
  let [confirmedCasesGroupedByProvince, setConfirmedCasesGroupedByProvince] = useState(false);
  let [confirmedCasesGroupedByDate, setConfirmedCasesGroupedByDate] = useState(false);
  let [prefersLightMode, setPrefersLightMode] = useState((typeof window !== 'undefined' && window.localStorage.getItem("prefersLightMode") === "true") ? true : false);
  let [mapType, setMapType] = useState((typeof window !== 'undefined' && window.localStorage.getItem("mapType")) ? window.localStorage.getItem("mapType") : "bubble");
  let [nextMapType, setNextMapType] = useState(false);
  let [dataType, setDataType] = useState((typeof window !== 'undefined' && window.localStorage.getItem("dataType")) ? window.localStorage.getItem("dataType") : "map");
  let [nextDataType, setNextDataType] = useState(false);
  let [confirmedCasesHeaderData, setConfirmedCasesHeaderData] = useState(false);
  let [hospitalData, setHospitalData] = useState(false);

  let mobile = isConsideredMobile();

  const getNextMapType = (mapType) => {
    switch(mapType) {
      case "bubble":
        return "choropleth";
      case "choropleth":
        return "bubble";
      default:
        return "choropleth";
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
      // axios.get(`https://raw.githubusercontent.com/dsfsi/covid19za/master/data/covid19za_timeline_testing.csv`),
      // axios.get(`https://raw.githubusercontent.com/dsfsi/covid19za/master/data/health_system_za_public_hospitals.csv`)
    ]).then(res => {
      let { data: confirmedCasesData } = res[0];
      // let { data: testingData } = res[1];
      // let { data: hospitalLocationData } = res[2];
      
      let parsedConfirmedCasesInstance = Papa.parse(confirmedCasesData);
      let parsedConfirmedCasesData = parsedConfirmedCasesInstance.data;
      // let parsedHospitalLocationInstance = Papa.parse(hospitalLocationData);
      // let parsedHospitalLocationData = parsedHospitalLocationInstance.data;

      let confirmedCasesHeaderRow = parsedConfirmedCasesData[0];
      let confirmedCasesIndexOfProvince = parsedConfirmedCasesData[0].indexOf("province");
      let confirmedCasesIndexOfDate = parsedConfirmedCasesData[0].indexOf("YYYYMMDD");
      let confirmedCasesGroupedByProvince = {};
      let confirmedCasesGroupedByDate = {};
      // let confirmedCasesGroupedByAge = {};
      let currentTotalCases = 0;

      for (let i = 1; i < parsedConfirmedCasesData.length; i++) {
        if (
          parsedConfirmedCasesData[i][confirmedCasesIndexOfProvince] &&
          parsedConfirmedCasesData[i][confirmedCasesIndexOfDate]
        ) {
          currentTotalCases++;
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

      setConfirmedCasesHeaderData(confirmedCasesHeaderRow);
      setConfirmedCasesGroupedByProvince(confirmedCasesGroupedByProvince);
      setConfirmedCasesGroupedByDate(confirmedCasesGroupedByDate);
      // setHospitalData(hospitalData);
      setTotalCases(currentTotalCases);
      
      let dataType = (typeof window !== 'undefined' && window.localStorage.getItem("dataType")) ? window.localStorage.getItem("dataType") : "map";
      let nextDataType = getNextDataType(dataType);
      setNextDataType(nextDataType);

      let mapType = (typeof window !== 'undefined' && window.localStorage.getItem("mapType")) ? window.localStorage.getItem("mapType") : "bubble";
      let nextMapType = getNextMapType(mapType);
      setNextMapType(nextMapType)
    })
  }, [])

  return (
    <Layout totalCases={totalCases}>
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
      {(confirmedCasesGroupedByDate && confirmedCasesHeaderData && dataType === "charts") && <OurChartCollection confirmedCasesHeaderData={confirmedCasesHeaderData} confirmedCasesGroupedByDate={confirmedCasesGroupedByDate}/>}
      {(confirmedCasesGroupedByProvince && dataType === "map") && <OurMap mapType={mapType} prefersLightMode={prefersLightMode} hospitalData={hospitalData} confirmedCasesGroupedByProvince={confirmedCasesGroupedByProvince}/>}
    </Layout>
  )
}

export default IndexPage
