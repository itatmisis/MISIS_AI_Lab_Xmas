
import '../styles/styles.scss';
import Header from "./Header/Header";
import Body from "./Body/Body";
import SpinnerComp from './SpinnerComp';
import { connect } from "react-redux"
import { NotificationContainer } from 'react-notifications';
import 'react-notifications/lib/notifications.css';

function Work(props) {

    return (<div className="App">

        <NotificationContainer />
        <Body />
        {props.spinner ? (
            <SpinnerComp />
        ) : (
            <div></div>
        )}
    </div>)
}
function mapStateToProps(state) {
    return {
        spinner: state.ui.spinner,
    }
}


export default connect(mapStateToProps)(Work)