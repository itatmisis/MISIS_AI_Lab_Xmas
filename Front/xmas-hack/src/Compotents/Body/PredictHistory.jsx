import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import axios from "axios";
import LoadedFile from "./LoadedFile";
import WordCloud from "./WordCloud";
import { Link } from "react-router-dom";
import { connect } from "react-redux"
import { bindActionCreators } from "redux";
import { storeActions } from "../../store/store"

function PredictHistory(props) {

    let [files, setFiles] = useState([])

    useEffect(() => {
        // React advises to declare the async function directly inside useEffect
        async function loadFiles() {
            try {
                const files = await axios.get("http://62.84.127.116:8888/UploadDocs/GetAllFiles");
                setFiles(files["data"])
                console.log(files["data"])
            } catch (ex) {
                console.log(ex);
            }
        }

        loadFiles();
    }, []);

    function chooseDocs(fileName, filePath) {
        props.setCurrentFile({
            name: fileName,
            path: filePath
        })
    }



    return (<div>

        <div>
            {files.map(file => (
                <Link to={"/DocsInfo"}
                    onClick={() => chooseDocs(file.name, file.path)}>
                    <LoadedFile
                        fileName={file.name}
                        filePath={file.path}
                        fileWeigth={0} />
                </Link>
            ))}
        </div>
    </div>)
}

function mapStateToProps(state) {
    return {
    }
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        setChoosedFiles: storeActions.setChoosedFiles,
        setSpinnerStatus: storeActions.setSpinnerStatus,
        setCurrentFile: storeActions.setCurrentFile
    }, dispatch)

}

export default connect(mapStateToProps, mapDispatchToProps)(PredictHistory)
