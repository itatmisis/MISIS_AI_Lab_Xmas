/* This example requires Tailwind CSS v3.0+ */
import { useState } from 'react'
// import {Dialog}
import { Dialog } from '@headlessui/react'
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'
import { connect } from "react-redux"
import { bindActionCreators } from "redux";
import { storeActions } from "../../store/store"
import axios from "axios";
import { PAGES_TYPE } from "../../Constants/Pages"
import { NotificationContainer, NotificationManager } from 'react-notifications';

const navigation = [
  { name: 'Product', href: '#' },
  { name: 'Features', href: '#' },
  { name: 'Marketplace', href: '#' },
  { name: 'Company', href: '#' },
]

function Example(props) {
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

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)


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


  // export default connect(mapStateToProps, mapDispatchToProps)(LoadFiles)

  return (
    <div className="isolate bg-white">
      <div className="absolute inset-x-0 -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[-20rem]">

        {/* <div className="header button_on_top">
                <Logo />
                <MenuItems />
        </div> */}

        <svg
          className="relative left-[calc(50%-11rem)] -z-10 h-[21.1875rem] max-w-none -translate-x-1/2 rotate-[30deg] sm:left-[calc(50%-30rem)] sm:h-[42.375rem] blur-fone"
          viewBox="0 0 1155 678"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >

          <path
            fill="url(#45de2b6b-92d5-4d68-a6a0-9b9b2abad533)"
            fillOpacity=".3"
            d="M317.219 518.975L203.852 678 0 438.341l317.219 80.634 204.172-286.402c1.307 132.337 45.083 346.658 209.733 145.248C936.936 126.058 882.053-94.234 1031.02 41.331c119.18 108.451 130.68 295.337 121.53 375.223L855 299l21.173 362.054-558.954-142.079z"
          />
          <defs>
            <linearGradient
              id="45de2b6b-92d5-4d68-a6a0-9b9b2abad533"
              x1="1155.49"
              x2="-78.208"
              y1=".177"
              y2="474.645"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#9089FC" />
              <stop offset={1} stopColor="#FF80B5" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      <div className="px-6 pt-6 lg:px-8">
        <div>
        </div>
      </div>
      <main>
        <div className="relative px-6 lg:px-8 all_example">
          <div className="mx-auto max-w-3xl pt-20 pb-32">
            <div>
              <div className="hidden sm:mb-8 sm:flex sm:justify-center">
                <div className="relative overflow-hidden rounded-full py-1.5 px-4 text-sm leading-6 ring-1 ring-gray-900/10 hover:ring-gray-900/20">
                  <span className="text-gray-600">
                    К загруженным файлам.{' '}
                    <span onClick={() => props.setPage(PAGES_TYPE.PREDICT_HISTORY)} href="#" className="font-semibold text-indigo-600">
                      <span className="absolute inset-0" aria-hidden="true" />
                      <span aria-hidden="true">&rarr;</span>
                    </span>
                  </span>
                </div>
              </div>
              <div>
                <h1 className="text-4xl font-bold tracking-tight sm:text-center sm:text-6xl">
                  Доверь свою работу нейронным подходам
                </h1>
                <p className="mt-6 text-lg leading-8 text-gray-600 sm:text-center">
                  Здесь вы можете определить тип договоров. Для этого вам надо выбрать один или несколько документов с вашего компьютера. Допустимые типу файлов: doc, docx, pdf.
                </p>
              </div>
              {/* <div className="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]">
                <svg
                  className="relative left-[calc(50%+3rem)] h-[21.1875rem] max-w-none -translate-x-1/2 sm:left-[calc(50%+36rem)] sm:h-[42.375rem]"
                  viewBox="0 0 1155 678"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fill="url(#ecb5b0c9-546c-4772-8c71-4d3f06d544bc)"
                    fillOpacity=".3"
                    d="M317.219 518.975L203.852 678 0 438.341l317.219 80.634 204.172-286.402c1.307 132.337 45.083 346.658 209.733 145.248C936.936 126.058 882.053-94.234 1031.02 41.331c119.18 108.451 130.68 295.337 121.53 375.223L855 299l21.173 362.054-558.954-142.079z"
                  />
                  <defs>
                    <linearGradient
                      id="ecb5b0c9-546c-4772-8c71-4d3f06d544bc"
                      x1="1155.49"
                      x2="-78.208"
                      y1=".177"
                      y2="474.645"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop stopColor="#9089FC" />
                      <stop offset={1} stopColor="#FF80B5" />
                    </linearGradient>
                  </defs>
                </svg>
              </div> */}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}


function mapStateToProps(state) {
  return {
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({
    setChoosedFiles: storeActions.setChoosedFiles,
    setSpinnerStatus: storeActions.setSpinnerStatus,
    setPage: storeActions.setPage
  }, dispatch)

}

export default connect(mapStateToProps, mapDispatchToProps)(Example)
