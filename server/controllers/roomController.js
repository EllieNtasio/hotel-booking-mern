import {v2 as cloudinary} from "cloudinary";
import Hotel from "../models/Hotel.js";
import Room from "../models/Room.js";
import { populate } from "dotenv";

//New Room
export const createRoom = async(req, res)=>{
   try {
     const {roomType, pricePerNight, amenities} = req.body;
     const hotel = await Hotel.findOne({owner: req.auth.userId})

     if (!hotel) return res.json({success: false, message: "No Hotel found"});

     const uploadImages = req.files.map(async(file)=>{
        const response = await cloudinary.uploader.upload(file.path);
        return response.secure_url;
     })
 
    const images = await Promise.all(uploadImages)
    await Room.create({
        hotel: hotel._id,
        roomType,
        pricePerNight: +pricePerNight,
        amenities: JSON.parse(amenities),
        images,
    })
    res.json({success: true, message: "Room created successfully!"})
   } catch (error){
    res.json({success: false, message: error.message})
   }
}

export const getRooms = async(req, res)=>{
   try {
    const rooms = (await Room.find({isAvailable: true})).populate({
        path: 'hotel',
        populate: {
            path: 'owner',
            select: 'image'
        }
    }).sort({createdAt: -1})
    res.json({success: true, rooms});
    
   } catch (error) {
    res.json({success: false, message: error.message});
   }
}

export const getOwnerRooms = async(req, res)=>{

}


export const toggleRoomAvailability = async(req, res)=>{

}