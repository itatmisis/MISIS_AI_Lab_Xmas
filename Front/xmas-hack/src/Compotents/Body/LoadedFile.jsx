import React from "react";
import PropTypes from "prop-types";
import pdf from "../../Content/images/pdf.png"
import doc from "../../Content/images/doc.png"


function LoadedFile(props) {

    const getFIleType = (fileName) => {
        if (fileName.endsWith('pdf')) {
            return "pdf"
        }

        if (fileName.endsWith(".doc") || fileName.endsWith(".docx")) {
            return "word"
        }

        return "word"
    }

    return (<div className="loadedFile">
        <div className="fileinfo">
            <div className="fileName">
                <span>{props.fileName}</span>

            </div>
            <div className="weigth">
                <span>Размер: {props.fileWeigth}кб</span>
            </div>
        </div>
        <div className="fileType">
            <img className="fileTypeImg" src={getFIleType(props.fileName) === "pdf" ? pdf : doc} />
        </div>
    </div>
    )
}




LoadedFile.propTypes = {
    fileName: PropTypes.string,
    fileWeigth: PropTypes.string,
}
export default LoadedFile;
