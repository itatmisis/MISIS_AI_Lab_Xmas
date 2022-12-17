import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { TagCloud } from 'react-tagcloud';


function WordCloud(props) {

    const [goodWords, setGoodWords] = useState([]);
    const [predictedClass, setPredictedClass] = useState([]);

    useEffect(() => {

        fetch(`http://62.84.127.116:8888/UploadDocs/GetJsonByName?name=${removeExtension(props.fileName)}`)
            .then((response) => response.json())
            .then((responseJson) => {
                // console.log(responseJson)
                const predClass = responseJson.predicted_class;
                setPredictedClass(predClass)
                console.log(predictedClass)
                const predictedClassInfo = responseJson.outputs_for_class[predClass];
                const predicedClassGoodWords = predictedClassInfo.tfidf_top_good.map(word => {
                    return {
                        value: word[0],
                        count: Math.floor(word[1] * 100)
                    }
                })
                setGoodWords([...predicedClassGoodWords]);
            })


    }, [])

    return (
        <div className="word-cloud">
            <div className="document-type">
                <p>Предсказанный класс: {predictedClass}</p>
            </div>
            <div className="tag-cloud-item">
                <TagCloud
                    minSize={12}
                    maxSize={35}
                    tags={goodWords}
                />
            </div>
        </div>
    )

}

WordCloud.propTypes = {
    fileName: PropTypes.string
}

function removeExtension(filename) {
    return filename.substring(0, filename.lastIndexOf('.')) || filename;
}

export default WordCloud;