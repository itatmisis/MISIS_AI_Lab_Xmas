import React from "react";
import { connect } from "react-redux"
import LoadedFile from "./LoadedFile";



function LoadedFiles(props) {

    return (<div className="loadedFiles">

        <div className="loadedFilesHeader">
            {props.files.length > 0 ? (
                <span className="loadedFiles">Загруженные файлы</span>
            ) : <div></div>}
        </div>
        <div className="files">
            {props.files.map(file => (
                <LoadedFile
                    fileName={file.name}
                    fileWeigth={file.size} />
            ))}
        </div>

    </div>)
}


function mapStateToProps(state) {
    return {
        files: state.data.files,
    }
}

export default connect(mapStateToProps)(LoadedFiles)