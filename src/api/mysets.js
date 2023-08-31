const URL_MYST = `http://localhost:8080/mysets/1`

export const getMySet = async () => {
    try {
        const res = await fetch(URL_MYST);
        return res.json();
    } catch (error) {
        console.error(`GET mySet error: ${error.message}`);
    }
}

export const putMySet = async (numbers) => {
    // fetch(URL_MYST,{
    //     method: 'PUT',
    //     headers: {'content-type': 'application/json'},
    //     body: JSON.stringify({
    //         id: 1,
    //         numbers: numbers
    //     })
    // })
    //     .then(response =>response.json())
    //     // .then(data =>console.log(data))

    // Use the Fetch API to make a PUT request
    fetch(URL_MYST, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
                    id: 1,
                    numbers: numbers
                })
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`Network response was not ok, status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            // console.log('PUT successful:', data);
            return data;
            // You can update your UI or perform further actions with the data
        })
        .catch(error => {
            console.error('PUT error:', error);
            // You might want to display an error message to the user
        });
}

export const updateData = (data) => {

    return fetch(URL_MYST, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            id: 1,
            numbers: data
        })
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`Network response was not ok, status: ${response.status}`);
            }
            return response.json();
        });
};
