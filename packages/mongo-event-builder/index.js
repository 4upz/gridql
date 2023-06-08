const { MongoClient } = require('mongodb');
const Kafka = require('kafkajs');

// create a Kafka client and producer


async function buildDb(mongo) {
    let client = await new MongoClient(mongo.uri, { useUnifiedTopology: true });
    await client.connect().catch((reason) => console.log(reason));
    return client.db(mongo.db).collection(mongo.collection);
}

const init = async ({mongo, kafkaHost}) => {
    const collection = await buildDb(mongo);
    const kafkaClient = new kafka.KafkaClient({ kafkaHost });
    const kafkaProducer = new kafka.Producer(kafkaClient);
    return {collection, kafkaProducer};
}

let payloads = [];

const toCRUD = (change) => {
    const verbs = {
        'insert': 'CREATE',
        'update': 'UPDATE',
        'delete': 'DELETE',
    }

    return verbs[change.operationType];
}


const toPayload = (topic, id) => (change) => {
    const operationType = toCRUD(change);
    if (operationType === undefined) {
        return null;
    }

    // get the document id
    const documentId = change.documentKey[id];

    // prepare a message to send to Kafka
    const message = {
        id: documentId.toString(),
        operation: operationType
    };

    return { topic: topic, messages: [JSON.stringify(message)] };
}

const start = async ({collection, kafkaProducer, topic, id ='_id'}) => {
    const changeStream = await collection.watch();

    const processChange = toPayload(topic, id);


    changeStream.on('change', async (change) => {
        console.log('Change detected:', change);
        let payload = processChange(change);
        if (payload !== null) {
            payloads.push(payload);
        }
        if(payloads.length > 0) {
            console.log("Sending: ", payloads);

            await kafkaProducer.send(payloads)
                .then(console.log("Sent"))
                .catch((reason) => console.log("Can't send: ", reason));
            payloads = [];
        }
    });
}

module.exports = {init, start};