const express = require('express')
const {generateSlug} = require('random-word-slugs')
const {ECSClient, RunTaskCommand} = require('@aws-sdk/client-ecs')
const Redis = require('ioredis')
const { Server } = require('socket.io')
const cors = require('cors')

const ecsClient = new ECSClient({
    region: '',
    credentials: {
        accessKeyId: "",
        secretAccessKey: "",
    }
})

const config = {
    CLUSTER: "arn:aws:ecs:us-east-1:471112769320:cluster/builder-cluster",
    TASK:"arn:aws:ecs:us-east-1:471112769320:task-definition/builder-task"
}

const subscriber = new Redis('rediss://default:AVNS_KYC152UAeIWv_6nhPl_@caching-366d1ddf-vercel-sspnow-xyz.g.aivencloud.com:21552');
const io = new Server({ cors: '*'})

io.on('connection', socket => {
    socket.on('subscribe', channel => {
        socket.join(channel);
        socket.emit('message', `Joined ${channel}`)
    })
})

const app = express();

app.use(express.json());
app.use(cors());

app.post('/project', async (req,res) => {
    const {gitURL, slug} = req.body
    const projectSlug = slug ? slug : generateSlug();

    const command = new RunTaskCommand({
        cluster: config.CLUSTER,
        taskDefinition: config.TASK,
        launchType: 'FARGATE',
        count: 1,
        networkConfiguration: {
            awsvpcConfiguration: {
                assignPublicIp: 'ENABLED',
                subnets: ['subnet-077c7f0d42c6cce9a', 'subnet-05c01acd14a29ff98', 'subnet-03d7359b2025682a7'],
                securityGroups: ['sg-06a436ec37d0d12e5']
            }
        },
        overrides: {
            containerOverrides: [
                {
                    name: 'builder-image',
                    environment: [
                        {name: 'GIT_REPOSITORY__URL', value: gitURL},
                        {name: 'PROJECT_ID', value: projectSlug}
                    ]
                }
            ]
        }
    })

    await ecsClient.send(command);

    return res.json({status: 'queued', data: {projectSlug, url: `http://${projectSlug}.localhost:4000`}})

})

async function initRedisSubscribe () {
    console.log("Subscribed to logs...");
    subscriber.psubscribe('logs:*')
    subscriber.on('pmessage', (pattern, channel, message) => {
        io.to(channel).emit('message', message);
    })
}

initRedisSubscribe();

app.listen(5000, () => {
    console.log("Server is running in the port 5000");
})

io.listen(5001, () => {
    console.log("Socket server is running at port 5001");
})
