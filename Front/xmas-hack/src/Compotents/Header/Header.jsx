import React from "react";
import PropTypes from "prop-types";
import MenuItems from "./MenuItems";
import Logo from "./Logo";

function Header(props) {

    return (<div className="header">
        <Logo />
        <MenuItems />
    </div>)
}

export default Header;