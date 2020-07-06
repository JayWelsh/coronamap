import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { useStaticQuery, graphql } from "gatsby";
import { createMuiTheme, ThemeProvider } from '@material-ui/core/styles';

import Header from "./header"
import "./layout.css"
import "./leaflet.css"

const Layout = ({ children, totalCases, totalRecovered, totalDead }) => {
  const data = useStaticQuery(graphql`
    query SiteTitleQuery {
      site {
        siteMetadata {
          title
        }
      }
    }
  `)

  let [useTotalCases, setTotalCases] = useState(false);
  let [useTotalRecovered, setTotalRecovered] = useState(false);
  let [useTotalDead, setTotalDead] = useState(false);

  useEffect(() => {
    setTotalCases(totalCases)
  }, [totalCases])

  useEffect(() => {
    setTotalRecovered(totalRecovered)
  }, [totalRecovered])

  useEffect(() => {
    setTotalDead(totalDead)
  }, [totalDead])

  const theme = createMuiTheme({
    palette: {
      type: 'dark',
      primary: {
        50: '#FFFFFF',
        100: '#2C2C2C',
        200: '#242424',
        300: '#0F0F0F',
        500: '#000000',
        A100: '#000000',
        A200: '#0F0F0F',
        A400: '#242424',
        A700: '#2C2C2C'
      },
    },
  })

  return (
    <ThemeProvider theme={theme}>
      <Header totalCases={useTotalCases} totalRecovered={useTotalRecovered} totalDead={useTotalDead} siteTitle={data.site.siteMetadata.title} />
      <div
        style={{
          margin: `0 auto`,
        }}
      >
        <main>{children}</main>
        <footer>

        </footer>
      </div>
    </ThemeProvider>
  )
}

Layout.propTypes = {
  children: PropTypes.node.isRequired,
}

export default Layout
