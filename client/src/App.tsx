import { useEffect, useMemo, useRef, useState } from "react";
import Input from "./components/Input";
import { Github } from "lucide-react";
import Button from "./components/Button";
import axios from "axios";
import {io} from "socket.io-client";

const socket = io("http://localhost:5001");

const App = () => {

  const [repoURL, setURL] = useState<string>("");
  const [logs, setLogs] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [projectId, setProjectId] = useState<string | undefined>();
  const [deployPreviewURL, setDeployPreviewURL] = useState<string | undefined>();

  const logContainerRef = useRef(null);

  const isValidURL: [boolean, string | null] = useMemo(() => {
    if (!repoURL || repoURL.trim() === "") return [false, null];
    const regex = new RegExp(
      /^(?:https?:\/\/)?(?:www\.)?github\.com\/([^\/]+)\/([^\/]+)(?:\/)?$/
    );
    return [regex.test(repoURL), "Enter valid Github Repository URL"];
  }, [repoURL]);

  const handleClickDeploy = async () => {
    setLoading(true);

    const {data} = await axios.post('http://localhost:5000/project', {
      gitURL: repoURL,
      slug: projectId,
    })

    if(data && data.data) {
      const {projectSlug, url} = data.data;
      setProjectId(projectSlug);
      setDeployPreviewURL(url);

      console.log(`Subscribing to logs: ${projectSlug}`);
      socket.emit('subscribe', `logs:${projectSlug}`);
    }
    
  }

  const handleSocketIncomingMessage = (message: string) => {
    console.log(`[Incoming Socket Message]:`, typeof message, message);
    const {log} = JSON.parse(message);
    setLogs((prev) => [...prev, log]);    
  }

  useEffect(() => {
    socket.on("message", handleSocketIncomingMessage);

    return () => {
      socket.off("message", handleSocketIncomingMessage)
    }
  }, [handleSocketIncomingMessage])

  return (
    <div className="flex justify-center items-center h-[100vh]">
      <div className="w-[600px]">
        <span className="flex justify-start items-center gap-2">
          <Github className="text-5xl"/>
          <Input placeholder="Github URL" type="url" disabled={loading} value={repoURL} onChange={(e) => {
            setURL(e.target.value)
          }}/>
          <Button onClick={handleClickDeploy} disabled={!isValidURL[0] || loading}>
          {loading ? "In Progress" : "Deploy"}
        </Button>
        </span>
        {deployPreviewURL && (
          <div className="mt-2 bg-slate-900 py-4 px-2 rounded-lg">
            <p>
              Preview URL{" "}
              <a
                target="_blank"
                rel="noopener noreferrer"
                className="text-sky-400 bg-sky-950 px-3 py-2 rounded-lg"
                href={deployPreviewURL}
              >
                {deployPreviewURL}
              </a>
            </p>
          </div>
        )}
        {logs.length > 0 && (
          <div className="text-sm text-green-500 logs-container mt-5 border-green-500 border-2 rounded-lg p-4 h-[300px] overflow-y-auto">
            <pre className="flex flex-col gap-1">
              {logs.map((log, i) => (
                <code
                  ref={logs.length - 1 === i ? logContainerRef : undefined}
                  key={i}
                >
                  {`> ${log}`}
                </code>
              ))}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
