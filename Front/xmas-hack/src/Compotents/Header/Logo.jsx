import React from "react"
import { connect } from "react-redux"
import { bindActionCreators } from "redux";
import { storeActions } from "../../store/store"
import { PAGES_TYPE } from "../../Constants/Pages"
import { Link } from "react-router-dom";


function Logo(props) {

    return (<Link to="/" style={{ textDecoration: 'none' }}>
        <div className="team-logo">
            <a className="logo" onClick={() => props.setPage(PAGES_TYPE.LOAD_FILES)}>MISIS AI Lab</a>
        </div>
    </Link>)
}


function mapStateToProps(state) {
    return {

    }
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        setPage: storeActions.setPage
    }, dispatch)

}

export default connect(mapStateToProps, mapDispatchToProps)(Logo)