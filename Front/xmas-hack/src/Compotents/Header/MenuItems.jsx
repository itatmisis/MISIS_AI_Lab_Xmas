import React from "react"
import { connect } from "react-redux"
import MenuItem from "./MenuItem"
import { bindActionCreators } from "redux";
import { storeActions } from "../../store/store"
import { PAGES_TYPE } from "../../Constants/Pages"
import { Link } from "react-router-dom";


function MenuItems(props) {

    return (
        <div className="menu-items-block">
            <Link to="/" style={{ textDecoration: 'none' }}>
                <MenuItem
                    Selected={props.page == PAGES_TYPE.LOAD_FILES}
                    ItemName="Загрузка файлов"
                    OnClick={() => props.setPage(PAGES_TYPE.LOAD_FILES)}
                />
            </Link>

            <Link to="/" style={{ textDecoration: 'none' }}>
                <MenuItem
                    Selected={props.page == PAGES_TYPE.PREDICT_HISTORY}
                    ItemName="История распознаваний"
                    OnClick={() => props.setPage(PAGES_TYPE.PREDICT_HISTORY)}
                />
            </Link>
        </div>
    )
}

function mapStateToProps(state) {
    return {
        page: state.ui.page,
    }
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        setPage: storeActions.setPage
    }, dispatch)

}

export default connect(mapStateToProps, mapDispatchToProps)(MenuItems)
