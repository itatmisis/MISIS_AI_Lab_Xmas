import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux"
import { bindActionCreators } from "redux";
import { storeActions } from "../../store/store"
import { PAGES_TYPE } from "../../Constants/Pages";
import LoadFiles from "./LoadFiles";
import PredictHistory from "./PredictHistory";
import LoadedFiles from "./LoadedFiles";
import Example from "./full_body";



function Body(props) {

    return (<div className="body">
        {props.page == PAGES_TYPE.LOAD_FILES ?
            (
                <div>
                    {/* <LoadFiles />
                    <LoadedFiles /> */}
                    {/* <Header /> */}
                    <Example />
                    <LoadFiles />
                    <LoadedFiles />
                </div>

            ) :
            (
                <PredictHistory />
            )}
    </div>)
}
function mapStateToProps(state) {
    return {
        page: state.ui.page,
    }
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        setPage: storeActions.setPage
    }, dispatch)

}

export default connect(mapStateToProps, mapDispatchToProps)(Body)
