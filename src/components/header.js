import { Link } from "gatsby"
import PropTypes from "prop-types"
import React from "react"
import { withStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import { valueFormatDisplay } from '../utils';

const styles = {
  root: {
    flexGrow: 1,
  },
  menuButton: {
    marginLeft: -12,
    marginRight: 5,
  },
};

class Header extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      siteTitle: props.siteTitle,
      anchorEl: null,
    };
  }

  shouldComponentUpdate(nextProps) {
    if (nextProps.totalCases !== this.state.totalCases) {
      return true;
    } else {
      return false;
    }
  }

  handleMenu = event => {
    this.setState({ anchorEl: event.currentTarget });
  };

  handleClose = () => {
    this.setState({ anchorEl: null });
  };

  toggleMenu = () => {
    // this.props.dispatch(showLeftMenu(!this.state.showLeftMenu));
  }

  render() {
    const { classes, totalCases, totalRecovered, totalDead } = this.props;
    const { anchorEl } = this.state;
    const open = Boolean(anchorEl);
    return (
      <div className={classes.root}>
        <AppBar position="static" className="transparent our-gradient">
          <Toolbar>
          </Toolbar>
        </AppBar>
        <AppBar position="fixed" className="our-gradient">
          <Toolbar className={"flex-between"}>
            {/* <IconButton onClick={() => this.toggleMenu()} className={classes.menuButton} color="inherit" aria-label="Menu">
              <MenuIcon />
            </IconButton> */}
            <div className={["logo-container"].join(" ")}>
              <Link className="no-highlight-on-mobile-link-element-click" to="/">
                <Typography className={"white-monospace"} variant="h4" component="h2">
                  coronamap
                </Typography>
              </Link>
            </div>
            <div style={{textAlign: 'right'}}>
              {totalCases &&
                <div style={{color: 'orange'}}>
                  <Typography className={"monospace"} style={{lineHeight: '1'}} variant="h6" component="h2">
                    {valueFormatDisplay(totalCases, 0)}&nbsp;cases
                  </Typography>
                </div>
              }
              {totalRecovered &&
                <div style={{color: '#4ef21f'}}>
                  <Typography className={"monospace"} style={{lineHeight: '1'}} variant="h6" component="h2">
                    {valueFormatDisplay(totalRecovered, 0)}&nbsp;recoveries
                  </Typography>
                </div>
              }
              {totalDead &&
                <div style={{color: 'red'}}>
                  <Typography className={"monospace"} style={{lineHeight: '1'}} variant="h6" component="h2">
                    {valueFormatDisplay(totalDead, 0)}&nbsp;deaths
                  </Typography>
                </div>
              }
            </div>
          </Toolbar>
        </AppBar>
      </div>
    );
  }
}

Header.propTypes = {
  siteTitle: PropTypes.string,
}

Header.defaultProps = {
  siteTitle: ``,
}

export default withStyles(styles)(Header);