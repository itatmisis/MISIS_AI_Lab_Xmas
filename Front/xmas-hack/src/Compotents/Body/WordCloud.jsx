import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { TagCloud } from 'react-tagcloud';
import { connect } from "react-redux"
import { bindActionCreators } from "redux";
import { storeActions } from "../../store/store"


function WordCloud(props) {

    const [goodWords, setGoodWords] = useState([]);
    const [predictedClass, setPredictedClass] = useState([]);
    const [topPhrases, setSelectTopPhrases] = useState("");
    const [probability, setProbability] = useState("")



    useEffect(() => {
        loadData();
    }, [])

    const loadData = () => {
        props.setSpinnerStatus(true)
        fetch(`http://62.84.127.116:8888/UploadDocs/GetJsonByName?name=${removeExtension(props.fileName)}`)
            .then((response) => response.json())
            .then((responseJson) => {
                console.log(responseJson)
                // console.log(responseJson)
                const predClass = responseJson.predicted_class;
                setPredictedClass(predClass)
                console.log(predictedClass)
                const predictedClassInfo = responseJson.outputs_for_class[predClass];
                const _topPhrases = predictedClassInfo.top_phrases;
                setSelectTopPhrases(_topPhrases);
                setProbability(predictedClassInfo.probability)
                const predicedClassGoodWords = predictedClassInfo.tfidf_top_good.map(word => {
                    return {
                        value: word[0],
                        count: Math.floor(word[1] * 100)
                    }
                })
                setGoodWords([...predicedClassGoodWords]);
                props.setSpinnerStatus(false);
            })
            .catch(error => {
                loadData();
            });
    }

    return (
        <div className="word-cloud">
            <div className="document-type">
                <p>Предсказанный класс: {predictedClass}</p>
            </div>
            <div className="document-type">
                <p>Уверенность модели: {probability}</p>
            </div>
            <div className="tag-cloud-item">
                <TagCloud
                    minSize={12}
                    maxSize={35}
                    tags={goodWords}
                />
            </div>
            <div className="document-type">
                <p>Ключевые фразы:</p>
            </div>
            <div className="top-phrases">
                <span>{topPhrases}</span>
            </div>
        </div >
    )

}

WordCloud.propTypes = {
    fileName: PropTypes.string
}

function removeExtension(filename) {
    return filename.substring(0, filename.lastIndexOf('.')) || filename;
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

export default connect(mapStateToProps, mapDispatchToProps)(WordCloud)