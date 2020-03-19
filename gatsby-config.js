module.exports = {
  siteMetadata: {
    title: `coronamap`,
    description: `Provincial Coronavirus Distribution Map of South Africa`,
    author: `@JayWelsh`,
  },
  plugins: [
    `gatsby-plugin-react-helmet`,
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `images`,
        path: `${__dirname}/src/images`,
      },
    },
    `gatsby-transformer-sharp`,
    `gatsby-plugin-sharp`,
    {
      resolve: `gatsby-plugin-manifest`,
      options: {
        name: `coronamap`,
        short_name: `coronamap`,
        start_url: `/`,
        background_color: `#232323`,
        theme_color: `#0c0715`,
        display: `standalone`,
        icon: `src/images/favicon.png`, // This path is relative to the root of the site.
      },
    },
    {
      resolve: `gatsby-plugin-s3`,
      options: {
        bucketName: "coronamap.co.za",
      },
    },
    // this (optional) plugin enables Progressive Web App + Offline functionality
    // To learn more, visit: https://gatsby.dev/offline
    // `gatsby-plugin-offline`,
    {
      resolve: `gatsby-plugin-offline`,
      options: {
        precachePages: [`/*`],
      },
    },
    {
      resolve: 'gatsby-plugin-react-leaflet',
      options: {
        linkStyles: false // (default: true) Enable/disable loading stylesheets via CDN
      }
    }
  ],
}
