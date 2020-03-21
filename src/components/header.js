import { Link } from "gatsby"
import PropTypes from "prop-types"
import React from "react"
import { withStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import MenuIcon from '@material-ui/icons/Menu';

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
    const { classes, totalCases } = this.props;
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
            <Typography className={"white-monospace"} variant="h5" component="h2">
              {totalCases} cases
            </Typography>
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