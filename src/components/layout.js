import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { useStaticQuery, graphql } from "gatsby";
import { createMuiTheme, ThemeProvider } from '@material-ui/core/styles';

import Header from "./header"
import "./layout.css"

const Layout = ({ children, totalCases }) => {
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

  useEffect(() => {
    setTotalCases(totalCases)
  }, [totalCases])

  const theme = createMuiTheme({
    palette: {
      type: 'dark',
    },
  })

  return (
    <ThemeProvider theme={theme}>
      <Header totalCases={useTotalCases} siteTitle={data.site.siteMetadata.title} />
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
