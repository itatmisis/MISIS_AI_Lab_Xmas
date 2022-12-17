import React, { useState } from "react";
import { connect } from "react-redux"
import { bindActionCreators } from "redux";
import { storeActions } from "../../store/store"
import axios from "axios";
import { NotificationContainer, NotificationManager } from 'react-notifications';

function LoadFiles(props) {

    const [files, setFiles] = useState([])

    const fileInputOnChange = (files) => {
        setFiles(files)
        var filesToStore = files.map(file => {
            return {
                name: file.name,
                size: Math.round(file.size / 1024)
            }
        })
        props.setChoosedFiles(filesToStore)
    }

    const sendFilesToBack = async () => {

        if (files.length === 0) {
            NotificationManager.warning('Необходимо выбрать файлы', '', 3000);
            return;
        }
        const formData = new FormData();
        files.forEach(file => {
            formData.append("files", file);
        })
        try {
            props.setSpinnerStatus(true);
            const res = await axios.post("http://62.84.127.116:8888/UploadDocs", formData);
            NotificationManager.info('Файлы успешно загружены', '', 3000);
            props.setChoosedFiles([])
        } catch (ex) {
            NotificationManager.error('Произошла ошибка во время загрузки файлов', '', 3000);
            console.log(ex);
        }
        props.setSpinnerStatus(false);
    }

    return (
        <div className="loadfiles">
            <div className="load-files-instruction">Здесь вы можете определить тип договоров. Для этого вам надо выбрать один или несколько документов
                с вашего компьютера. Допустимые типу файлов: doc, docx, pdf.
            </div>
            <label for="files" className="btn"></label>
            <input
                id="files"
                type="file"
                multiple="multiple"
                accept=".doc,.docx,application/pdf, application/msword"
                onChange={e => fileInputOnChange([...e.target.files])} />
            <br />
            <button
                className="send-files-btn"
                type='submit'
                onClick={sendFilesToBack}>
                <p>Определить тип</p>
            </button>
        </div >)
}

function mapStateToProps(state) {
    return {
    }
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        setChoosedFiles: storeActions.setChoosedFiles,
        setSpinnerStatus: storeActions.setSpinnerStatus
    }, dispatch)

}

export default connect(mapStateToProps, mapDispatchToProps)(LoadFiles)
