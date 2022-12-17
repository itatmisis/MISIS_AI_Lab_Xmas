import React from "react";
import PropTypes from "prop-types";


function MenuItem(props) {

    return (
        <div className="menu-item-block" onClick={props.OnClick}>
            <p className={props.Selected === true ? "selected menu-item-name " : "menu-item-name"}>{props.ItemName}</p>
            {props.Selected === true ? (
                <div className="choosed-line"></div>
            ) : (<div></div>)}
        </div>
    )
}

MenuItem.propTypes = {
    ItemName: PropTypes.string,
    Selected: PropTypes.bool,
    OnClick: PropTypes.func,
}

export default MenuItem
