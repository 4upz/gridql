const callSubgraph = async (url, query, queryName) => {
    const body = JSON.stringify({"query": query});
    console.log(`Sending: ${body} to ${url}`);

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
        body: body
    });

    const json = await response.json();

    if (json.hasOwnProperty('errors')) {
        console.log(json);
    }

    return json["data"][queryName];
};

module.exports = {
    callSubgraph
}