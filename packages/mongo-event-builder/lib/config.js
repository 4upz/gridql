const {Kafka, logLevel} = require("kafkajs");
const parser = require("@pushcorn/hocon-parser");
const {buildDb} = require("@gridql/mongo-connector");

const init = async (configFile) => {
    const config = await parser
        .parse({url: configFile})
        .catch((e) => console.log("Error parse config: ", e));

    console.log("Config: ", config);

    const {mongo, kafka} = config;

    //console.log(kafka);

    let k = new Kafka({
        logLevel: logLevel.INFO,
        brokers: kafka.brokers,
        clientId: kafka.clientId,
    });

    const collection = await buildDb(mongo);

    const kafkaProducer = k.producer();

    await kafkaProducer
        .connect()
        .then(() => console.log("Connected to Kafka"))
        .catch((reason) => {
                console.log("Kafka Producer failed to connect: ", reason);
                throw new Error(reason);
            }
        );

    return {collection, kafkaProducer, topic: kafka.topic, id: kafka.id};
};

module.exports = {
    init
}