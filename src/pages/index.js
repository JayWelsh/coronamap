import React, { Component, useState, useEffect } from "react";
import Papa from 'papaparse';
import axios from 'axios';

import Layout from "../components/layout";
import SEO from "../components/seo";
import OurMap from "../components/OurMap";

const IndexPage = () => {
  
  let [totalCases, setTotalCases] = useState(false);
  let [groupedByProvince, setGroupedByProvince] = useState(false);

  useEffect(() => {
    axios.get(`https://raw.githubusercontent.com/dsfsi/covid19za/master/data/covid19za_timeline_confirmed.csv`).then(res => {
      let { data } = res;
      let parsedInstance = Papa.parse(data);
      let parsedData = parsedInstance.data;
      let indexOfProvince = parsedData[0].indexOf("province");
      let indexOfDate = parsedData[0].indexOf("date");
      let groupedByProvince = {};
      let groupedByDate = {};
      let groupedByAge = {};
      let currentTotalCases = 0;
      for (let i = 1; i < parsedData.length; i++) {
        if (
          parsedData[i][indexOfProvince] &&
          parsedData[i][indexOfDate]
        ) {
          currentTotalCases++;
          if (groupedByProvince[parsedData[i][indexOfProvince]]) {
            groupedByProvince[parsedData[i][indexOfProvince]].push(parsedData[i]);
          } else {
            groupedByProvince[parsedData[i][indexOfProvince]] = [parsedData[i]];
          }
          if (groupedByDate[parsedData[i][indexOfDate]]) {
            groupedByDate[parsedData[i][indexOfDate]].push(parsedData[i]);
          } else {
            groupedByDate[parsedData[i][indexOfDate]] = [parsedData[i]];
          }
        }
      }
      setGroupedByProvince(groupedByProvince);
      setTotalCases(currentTotalCases);
    })
  }, [])

  return (
    <Layout totalCases={totalCases}>
      <SEO title="Home" />
      {groupedByProvince && <OurMap groupedByProvince={groupedByProvince}/>}
    </Layout>
  )
}

export default IndexPage
