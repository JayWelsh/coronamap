import React, { Component, useState, useEffect } from "react";
import Papa from 'papaparse';
import axios from 'axios';
import Typography from '@material-ui/core/Typography';

import SouthAfrica from "../south-africa.json";
import Layout from "../components/layout";
import SEO from "../components/seo";
import OurMap from "../components/OurMap";

const isConsideredMobile = () => {
  var check = false;
  if (typeof window !== 'undefined') {
    (function (a) { if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4)) || (window.innerWidth <= 720)) check = true; })(navigator.userAgent || navigator.vendor || window.opera);
  }
  return check;
};

const IndexPage = () => {
  let position = [-28.738176, 24.767929];
  let options = {
    style: {
      height: 'calc(100vh - 64px)',
      width: '100%'
    },
    center: position,
    zoom: isConsideredMobile() ? 4.5 : 6,
    minZoom: isConsideredMobile() ? 4.5 : 5.5,
    maxZoom: 8,
    zoomSnap: 0.5
  }

  let [markers, setMarkers] = useState(false);
  let [totalCases, setTotalCases] = useState(false);

  useEffect(() => {
    axios.get(`https://raw.githubusercontent.com/dsfsi/covid19za/master/data/covid19za_timeline_confirmed.csv`).then(res => {
      let { data } = res;
      let parsedInstance = Papa.parse(data);
      let parsedData = parsedInstance.data;
      let indexOfProvince = parsedData[0].indexOf("province");
      let groupedByProvince = {};
      let currentTotalCases = 0;
      for (let i = 1; i < parsedData.length; i++) {
        if (parsedData[i][indexOfProvince]) {
          if (groupedByProvince[parsedData[i][indexOfProvince]]) {
            currentTotalCases++;
            groupedByProvince[parsedData[i][indexOfProvince]].push(parsedData[i]);
          } else {
            currentTotalCases++;
            groupedByProvince[parsedData[i][indexOfProvince]] = [parsedData[i]];
          }
        }
      }
      let markers = [];
      let maxRadius = isConsideredMobile() ? 20 : 50;
      let minRadius = isConsideredMobile() ? 10 : 15;
      let radiusDelta = maxRadius - minRadius;
      let reachMaxRadiusAt = 61;
      let { provinces } = SouthAfrica;
      for (let province of Object.keys(provinces)) {
        if (groupedByProvince[province]) {
          let provinceCaseCount = groupedByProvince[province].length;
          let setRadius = minRadius + (((provinceCaseCount * 100 / reachMaxRadiusAt) / 100) * radiusDelta);
          markers.push({
            position: provinces[province].position,
            color: "#ff0081",
            radius: setRadius,
            tooltipText: (
              <Typography className={"white-monospace line-height-1"} variant="h6" component="h2">
                <sup>{provinces[province].name}</sup><br />
                <b>{provinceCaseCount}</b> {provinceCaseCount > 1 ? "Cases" : "Case"}
              </Typography>
            )
          })
        } else {
          markers.push({
            position: provinces[province].position,
            color: "green",
            radius: minRadius,
            tooltipText: (
              <Typography className={"white-monospace line-height-1"} variant="h6" component="h2">
                <sup>{provinces[province].name}</sup><br />
                <b>0</b> Cases
              </Typography>
            )
          })
        }
      }
      setMarkers(markers);
      setTotalCases(currentTotalCases);
    })
  }, [])

  return (
    <Layout totalCases={totalCases}>
      <SEO title="Home" />
      {markers && <OurMap options={options} markers={markers}></OurMap>}
    </Layout>
  )
}

export default IndexPage
