import React from "react";
import PropTypes from "prop-types";
import WordCloud from "./WordCloud";
import { connect } from "react-redux"
import { storeActions } from "../../store/store"
import { Navigate } from "react-router-dom";
import SpinnerComp from "../SpinnerComp";

function DocsInfo(props) {


    return (
        <div >
            {
                props.docsIndo?.name ? (
                    <div className="docsInfo">
                        <div className="document-type">
                            <p>Документ: <span className="type-name">{props.docsIndo?.name}</span></p>
                        </div>
                        <div className="wordCloud">
                            <WordCloud
                                fileName={props.docsIndo?.path} />
                        </div>
                        {props.spinner ? (
                            <SpinnerComp />
                        ) : (
                            <div></div>
                        )}
                    </div>
                ) : (
                    <Navigate to='/' />
                )
            }

        </div>
    )
}

function mapStateToProps(state) {
    return {
        docsIndo: state.data.currentDocsInfo,
        spinner: state.ui.spinner
    }
}

export default connect(mapStateToProps)(DocsInfo);