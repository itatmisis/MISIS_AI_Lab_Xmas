import React from "react";
import PropTypes from "prop-types";
import WordCloud from "./WordCloud";
import { connect } from "react-redux"
import { storeActions } from "../../store/store"
import { Navigate } from "react-router-dom";

function DocsInfo(props) {


    return (
        <div >
            {
                props.docsIndo?.name ? (
                    <div className="docsInfo">
                        <div className="document-type">
                            <p>Название документа: <span className="type-name">{props.docsIndo?.name}</span></p>
                        </div>
                        <div className="wordCloud">
                            <WordCloud
                                fileName={props.docsIndo?.path} />
                        </div>
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
        docsIndo: state.data.currentDocsInfo
    }
}

export default connect(mapStateToProps)(DocsInfo);