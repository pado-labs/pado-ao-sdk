import {
    result,
    message,
    dryrun,
} from "@permaweb/aoconnect";

import { TASKS_PROCESS_ID } from "../config";

export const submit = async (taskType: string, inputData: string, 
    computeLimit: string, memoryLimit: string, computeNodes: string[], signer: any) => {
    const msgId = await message({
        process: TASKS_PROCESS_ID,
        tags: [
          { name: "Action", value: "Submit" },
          { name: "TaskType", value: taskType},
          { name: "ComputeLimit", value: computeLimit},
          { name: "MemoryLimit", value: memoryLimit},
          { name: "ComputeNodes", value: JSON.stringify(computeNodes)},
        ],
        signer: signer,
        data: inputData,
    });
    let { Messages } = await result({
        message: msgId,
        process: TASKS_PROCESS_ID,
    });
    const res = Messages[0].Data;
    return res;
}

export const getPendingTasks = async () => {
    let { Messages } = await dryrun({
        process: TASKS_PROCESS_ID,
        tags: [
          { name: "Action", value: "GetPendingTasks" },
        ],
    });
    const res = Messages[0].Data;
    return res;
}

export const reportResult = async (taskId: string, nodeName: string,
    taskResult: string, signer: any) => {
    const msgId = await message({
        process: TASKS_PROCESS_ID,
        tags: [
          { name: "Action", value: "ReportResult" },
          { name: "TaskId", value: taskId },
          { name: "NodeName", value: nodeName },
        ],
        signer: signer,
        data: taskResult,
    });
    let { Messages } = await result({
        message: msgId,
        process: TASKS_PROCESS_ID,
    });
    const res = Messages[0].Data;
    return res;
}

export const getCompletedTasksById = async (
    taskId: string) => {
    let { Messages } = await dryrun({
        process: TASKS_PROCESS_ID,
        tags: [
          { name: "Action", value: "GetCompletedTasksById" },
          { name: "TaskId", value: taskId },
        ],
    });
    console.log("getCompletedTasksById Messages=", Messages);
    let res = "{}";
    if (Messages[0] && Messages[0].Data) {
        res = Messages[0].Data;
    }
    return res;
}

export const getCompletedTasks = async () => {
    let { Messages } = await dryrun({
        process: TASKS_PROCESS_ID,
        tags: [
          { name: "Action", value: "GetCompletedTasks" },
        ],
    });
    const res = Messages[0].Data;
    return res;
}

export const getAllTasks = async () => {
    let { Messages } = await dryrun({
        process: TASKS_PROCESS_ID,
        tags: [
          { name: "Action", value: "GetAllTasks" },
        ],
    });
    const res = Messages[0].Data;
    return res;
}
