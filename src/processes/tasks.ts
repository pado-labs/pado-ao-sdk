import {
    result,
    message,
  } from "@permaweb/aoconnect";

import { TASKS_PROCESS_ID } from "../config";

export const submit = async (type: string, inputData: string, 
    computeLimit: string, memoryLimit: string, signer: any) => {
    const msgId = await message({
        process: TASKS_PROCESS_ID,
        tags: [
          { name: "Action", value: "Submit" },
          { name: "Type", value: type},
          { name: "ComputeLimit", value: computeLimit},
          { name: "MemoryLimit", value: memoryLimit},
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

export const getPendingTasks = async (signer: any) => {
    const msgId = await message({
        process: TASKS_PROCESS_ID,
        tags: [
          { name: "Action", value: "GetPendingTasks" },
        ],
        signer: signer,
    });
    let { Messages } = await result({
        message: msgId,
        process: TASKS_PROCESS_ID,
    });
    const res = Messages[0].Data;
    return res;
}

export const reportResult = async (taskId: string, 
    taskResult: string, signer: any) => {
    const msgId = await message({
        process: TASKS_PROCESS_ID,
        tags: [
          { name: "Action", value: "ReportResult" },
          { name: "TaskId", value: taskId },
          { name: "Result", value: taskResult },
        ],
        signer: signer,
    });
    let { Messages } = await result({
        message: msgId,
        process: TASKS_PROCESS_ID,
    });
    const res = Messages[0].Data;
    return res;
}

export const getCompletedTasksById = async (
    taskId: string, signer: any) => {
    const msgId = await message({
        process: TASKS_PROCESS_ID,
        tags: [
          { name: "Action", value: "GetCompletedTasksById" },
          { name: "TaskId", value: taskId },
        ],
        signer: signer,
    });
    let { Messages } = await result({
        message: msgId,
        process: TASKS_PROCESS_ID,
    });
    const res = Messages[0].Data;
    return res;
}

export const getCompletedTasks = async (signer: any) => {
    const msgId = await message({
        process: TASKS_PROCESS_ID,
        tags: [
          { name: "Action", value: "GetCompletedTasks" },
        ],
        signer: signer,
    });
    let { Messages } = await result({
        message: msgId,
        process: TASKS_PROCESS_ID,
    });
    const res = Messages[0].Data;
    return res;
}

export const getAllTasks = async (signer: any) => {
    const msgId = await message({
        process: TASKS_PROCESS_ID,
        tags: [
          { name: "Action", value: "GetAllTasks" },
        ],
        signer: signer,
    });
    let { Messages } = await result({
        message: msgId,
        process: TASKS_PROCESS_ID,
    });
    const res = Messages[0].Data;
    return res;
}
