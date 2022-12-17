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
        <div className="loadfiles daniil_galimov">
            {/* <div className="load-files-instruction">Здесь вы можете определить тип договоров. Для этого вам надо выбрать один или несколько документов
                с вашего компьютера. Допустимые типу файлов: doc, docx, pdf.
            </div> */}
            <input
                id="files"
                // style="position: relative"
                className="inline-block rounded-lg bg-indigo-600 px-4 py-1.5 text-base font-semibold leading-7 text-white shadow-sm ring-1 ring-indigo-600 hover:bg-indigo-700 hover:ring-indigo-700 button_on_top"
                type="file"
                multiple="multiple"
                accept=".doc,.docx,application/pdf, application/msword"
                onChange={e => fileInputOnChange([...e.target.files])} />
            <br />
            <button
                className="inline-block rounded-lg px-4 py-1.5 text-base font-semibold leading-7 text-gray-900 ring-1 ring-gray-900/10 hover:ring-gray-900/20 button_on_top"
                type='submit'
                // className="button_on_top"
                onClick={sendFilesToBack}>
                <p>Определить тип</p>
            </button>
            <label className="btn"></label>
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
