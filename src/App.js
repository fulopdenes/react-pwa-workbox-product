import {useEffect, useState} from "react";
import {getAllIncomingProductList, getAllReceivedProductList, resetDatabase} from "./api/products";
import ConfirmationModal from './ConfirmationModal';

function ProductItem({
                         product,
                         onClickAccept,
                         onClickAcceptWithDamage,
                         onClickDecline,
                         collectProductInfo,
                         resetProductState,
                         isResetAllClicked,
                         inputConfirmed
                     }) {
    const [isDisabled, setIsDisabled] = useState(false);
    const [status, setStatus] = useState('');

    useEffect(() => {
        if (isResetAllClicked) {
            setIsDisabled(false);
            setStatus('');
        }
    }, [isResetAllClicked]);

    const handleAccept = () => {
        onClickAccept(product.id);
        setIsDisabled(true);
        setStatus('Accepted');
        collectProductInfo(product.id, 'Accepted');
    };

    const handleAcceptWithDamage = () => {
        onClickAcceptWithDamage(product.id);
        setIsDisabled(true);
        setStatus('acp-with-com');
        collectProductInfo(product.id, 'Acp_Wth_Com');
    };

    const handleDecline = () => {
        onClickDecline(product.id);
        setIsDisabled(true);
        setStatus('Declined');
        collectProductInfo(product.id, 'Declined');
    };

    const handleReset = () => {
        setIsDisabled(false);
        setStatus('');
        collectProductInfo(product.id, null);
        resetProductState(product.id);
    };

    const cardClassName = `product-card ${status.toLowerCase()}`;

    return (
        <div className={cardClassName} style={{
            display: 'flex',
            flexDirection: 'column',
            border: '1px solid #ccc',
            padding: '16px',
            borderRadius: '8px',
            marginLeft: '8px',
            marginRight: '8px',
            marginBottom: '16px'
        }}>
            <h3 style={{margin: '4px 0'}}>{product.productName}</h3>
            <p style={{margin: '2px 0'}}>Tech Code: {product.productTechCode}</p>
            <p style={{margin: '2px 0'}}>ID: {product.id}</p>
            <p style={{margin: '2px 0'}}>Quantity: {product.quantity} {product.quantityType}</p>
            {product.storedBy === null ? (
                <>
                    <button onClick={handleAccept} disabled={isDisabled || !inputConfirmed}>Accept</button>
                    <button onClick={handleAcceptWithDamage} disabled={isDisabled || !inputConfirmed}>Accept with
                        Damage
                    </button>
                    <button onClick={handleDecline} disabled={isDisabled || !inputConfirmed}>Decline</button>
                    <p style={{margin: '2px 0'}}>Status: {status}</p>
                    <button onClick={handleReset}>Reset</button>
                </>
            ) : (
                <>
                    <p style={{margin: '2px 0'}}>StoredBy: {product.storedBy}</p>
                    <p style={{margin: '2px 0'}}>HandoverAt: {product.timeOfArrivedAtSite}</p>
                </>
            )}
        </div>
    );
}

function formatDateForJavaBackend(inputDate) {
    const year = inputDate.getFullYear();
    const month = String(inputDate.getMonth() + 1).padStart(2, '0');
    const day = String(inputDate.getDate()).padStart(2, '0');
    const hour = String(inputDate.getHours()).padStart(2, '0');
    const minute = String(inputDate.getMinutes()).padStart(2, '0');
    const second = String(inputDate.getSeconds()).padStart(2, '0');

    return `${year}-${month}-${day}T${hour}:${minute}:${second}`;
}

function ProductList({
                         products,
                         onClickAccept,
                         onClickAcceptWithDamage,
                         onClickDecline,
                         fetchData,
                         userName,
                         inputConfirmed
                     }) {
    const [handOverData, setHandOverData] = useState([]);
    const [isResetAllClicked, setIsResetAllClicked] = useState(false);
    const [showReport, setShowReport] = useState(false);
    const [showModal, setShowModal] = useState(false);

    const [requestStatus, setRequestStatus] = useState({
        loading: false,
        success: false,
        error: false,
    });

    useEffect(() => {
        if (isResetAllClicked) {
            setTimeout(() => {
                setIsResetAllClicked(false);
            }, 100);
        }
    }, [isResetAllClicked]);


    const collectProductInfo = (productId, status) => {
        const productDetails = products.find(product => product.id === productId);


        const updatedData = handOverData.map(data => {
            if (data.productId === productId) {
                return {
                    ...data,
                    ...productDetails,
                    handoverStatus: status,
                    timeOfArrivedAtSite: formatDateForJavaBackend(new Date()),
                    storedBy: userName
                };
            }
            return data;
        });

        if (!updatedData.some(data => data.productId === productId)) {
            updatedData.push({
                productId,
                ...productDetails,
                storedBy: userName,
                timeOfArrivedAtSite: formatDateForJavaBackend(new Date()),
                handoverStatus: status
            });
        }

        setHandOverData(updatedData);
    };

    const formatCollectedInfoForBackend = () => {
        if (handOverData.length === 0 || userName === '') {
            console.log('No data to send for handover or user name not provided');
            return; // Don't send a request
        }


        // Set loading status
        setRequestStatus({loading: true, success: false, error: false});

        const formattedData = handOverData.map(item => ({
            productId: item.productId,
            productName: item.productName,
            productTechCode: item.productTechCode,
            quantity: item.quantity,
            quantityType: item.quantityType,
            handoverStatus: item.handoverStatus.toUpperCase(),
            timeOfArrivedAtSite: item.timeOfArrivedAtSite,
            storedBy: item.storedBy
        }));
        // console.log(formattedData);
        // Send formattedData to the backend using an API call
        fetch('http://localhost:8080/products/handover', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formattedData)
        })
            .then(response => {
                if (response.ok) {
                    setRequestStatus({loading: false, success: true, error: false});
                    console.log('Handover data sent successfully');
                    // Refresh the product list
                    setHandOverData([]); // Reset the handOverData state
                    fetchData();
                } else {
                    setRequestStatus({loading: false, success: false, error: true});
                    console.error('Failed to send handover data');
                }
            })
            .catch(error => {
                setRequestStatus({loading: false, success: false, error: true});
                console.error('Error while sending handover data:', error);
            });
    };

    const hideReport = () => {
        setShowReport(false);
    };

    const generateReport = () => {
        setShowReport(true)
    };

    const openModal = () => {
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
    };

    const confirmReset = () => {
        setHandOverData([]);
        setIsResetAllClicked(true);
        const productCards = document.querySelectorAll('.product-card');
        productCards.forEach(card => {
            card.classList.remove('accepted', 'accept-with-damage', 'declined');
        });
        closeModal();
    };

    const resetAllProductStatuses = () => {
        openModal();
    };

    const resetProductState = (productId) => {
        const updatedData = handOverData.filter(data => data.productId !== productId);
        setHandOverData(updatedData);
    };

    return (
        <>
            <div>
                {products === undefined ? (
                    <p style={{textAlign: 'center', margin: '20px'}}>Loading ...</p>
                ) : (
                    <div>
                        {products.length === 0 ? (
                            <p style={{textAlign: 'center', margin: '20px'}}>This result list is empty.</p>
                        ) : (
                            <>

                                <div className="product-list-container">
                                    {products.map((product) => (
                                        <ProductItem
                                            key={product.id}
                                            product={product}
                                            onClickAccept={onClickAccept}
                                            onClickAcceptWithDamage={onClickAcceptWithDamage}
                                            onClickDecline={onClickDecline}
                                            collectProductInfo={collectProductInfo}
                                            resetProductState={resetProductState}
                                            isResetAllClicked={isResetAllClicked}
                                            userName={userName}
                                            inputConfirmed={inputConfirmed}
                                        />
                                    ))}
                                </div>
                                <div className="product-list-buttons">
                                    <button
                                        onClick={showReport ? hideReport : generateReport}
                                        disabled={products.length === 0}
                                    >
                                        {showReport ? "Hide Summary Table" : "Show Summary Table"}
                                    </button>
                                    <button
                                        style={{marginTop: '20px'}}
                                        onClick={resetAllProductStatuses}
                                        disabled={products.length === 0}
                                    >
                                        Reset All Card State
                                    </button>

                                    {/* Modal */}
                                    {showModal && (
                                        <ConfirmationModal
                                            message="Are you sure?"
                                            onCancel={closeModal}
                                            onConfirm={confirmReset}
                                        />
                                    )}
                                </div>
                                {showReport && (
                                    <div style={{marginTop: '20px'}}>
                                        <h2 style={{textAlign: 'center'}}>Summary Table</h2>
                                        <table
                                            style={{
                                                borderCollapse: 'collapse',
                                                width: '100%',
                                                border: '1px solid black'
                                            }}>
                                            <thead>
                                            <tr>
                                                <th style={{textAlign: 'center', width: '15%'}}>Id</th>
                                                <th style={{textAlign: 'center', width: '20%'}}>Name</th>
                                                <th style={{textAlign: 'center', width: '15%'}}>Tech.Id</th>
                                                <th style={{textAlign: 'center', width: '20%'}}>Qty.</th>
                                                <th style={{textAlign: 'center', width: '30%'}}>Status</th>
                                            </tr>
                                            </thead>
                                            <tbody>
                                            {handOverData.map((item) => (
                                                <tr key={item.productId}>
                                                    <td style={{textAlign: 'center'}}>{item.productId}</td>
                                                    <td style={{textAlign: 'center'}}>{item.productName}</td>
                                                    <td style={{textAlign: 'center'}}>{item.productTechCode}</td>
                                                    <td style={{textAlign: 'center'}}>{`${item.quantity} ${item.quantityType}`}</td>
                                                    <td style={{textAlign: 'center'}}>{item.handoverStatus}</td>
                                                </tr>
                                            ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'center',
                                    marginTop: '20px',
                                    flexDirection: 'column'
                                }}>
                                    <button
                                        onClick={formatCollectedInfoForBackend}
                                        disabled={handOverData.length === 0 || requestStatus.loading || showModal || userName === ''}
                                        style={{position: 'relative'}}
                                    >
                                        {requestStatus.loading ? (
                                            <div className="loading-circle"/>
                                        ) : (
                                            'Finish Handover Process'
                                        )}
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                )}
            </div>
        </>

    );
}


function App() {
    const [productData, setProductData] = useState([]);
    const [userName, setUserName] = useState('');
    const [inputConfirmed, setInputConfirmed] = useState(false);
    const [showProductList, setShowProductList] = useState(false); // State to control showing the ProductList

    const fetchIncomingMaterialsData = async () => {
        try {
            const data = await getAllIncomingProductList();
            setProductData(data.success ? data.data : []);
        } catch (error) {
            console.log(error);
            setProductData([]);
        }
    };

    const fetchReceivedMaterialsData = async () => {
        try {
            const data = await getAllReceivedProductList();
            setProductData(data.success ? data.data : []);
        } catch (error) {
            console.log(error);
            setProductData([]);
        }
    };

    const fetchResetDatabase = async () => {
        const data = await resetDatabase();
        setProductData(data.success ? []: productData);
    };


    const handleAccept = () => {
        // Logic to handle accept for the specific product
    };

    const handleAcceptWithDamage = () => {
        // Logic to handle accept with damage for the specific product
    };

    const handleDecline = () => {
        // Logic to handle decline for the specific product
    };

    const handleConfirm = () => {
        setInputConfirmed(true);
    };

    const handleChange = () => {
        setInputConfirmed(false);
        setUserName('');
    };

    const handleIncomingMaterialList = () => {
        fetchIncomingMaterialsData(); // Fetch data when the button is clicked
        setShowProductList(true);
    };

    function handleReceivedMaterialList() {
        fetchReceivedMaterialsData();
        setShowProductList(true);
    }

    function handleResetDatabase() {
        fetchResetDatabase();
        setShowProductList(false);
    }


    return (
        <div style={{padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
            <h2 style={{textAlign: 'center'}}>Handover List</h2>
            <div style={{display: 'flex', marginBottom: '10px'}}>
                <input
                    type="text"
                    placeholder="Enter your name"
                    value={userName}
                    onChange={(e) => {
                        if (!inputConfirmed) {
                            setUserName(e.target.value);
                        }
                    }}
                    style={{padding: '5px'}}
                    disabled={inputConfirmed}
                />
                <button onClick={handleConfirm} style={{marginLeft: '10px'}}
                        disabled={userName.length === 0 || inputConfirmed}>Confirm
                </button>
                <button onClick={handleChange} style={{marginLeft: '10px'}} disabled={!inputConfirmed}>Reset</button>
            </div>
            <button
                onClick={handleIncomingMaterialList}
                style={{marginBottom: '10px'}}
            >
                Get Incoming Materials
            </button>
            <button
                onClick={handleReceivedMaterialList}
                style={{marginBottom: '10px'}}
            >
                Get Received Materials
            </button>

            <button
                onClick={handleResetDatabase}
                style={{marginBottom: '10px'}}
            >
                Reset Database
            </button>

            {showProductList && (
                <ProductList
                    products={productData}
                    onClickAccept={handleAccept}
                    onClickAcceptWithDamage={handleAcceptWithDamage}
                    onClickDecline={handleDecline}
                    fetchData={fetchIncomingMaterialsData}
                    userName={userName}
                    inputConfirmed={inputConfirmed}
                />
            )}
        </div>
    );
}

export default App;

