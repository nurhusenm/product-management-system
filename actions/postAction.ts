"use server"

import connectDB from "@/config/database"
import postModel from "@/models/postModel";

export async function getPosts() {
    try {
        await connectDB();
        const data = await postModel.find();

        console.log(data)

        return {msg: "GET", data}
    } catch (error: any) {
        console.log(error.message)
    }
    
}