import express from "express";
import multer from "multer";
import { UploadApiResponse, v2 as cloudinary } from "cloudinary";
import File from "../models/File";
const router = express.Router();
import https from "https";

const storage = multer.diskStorage({});

//this will use temp storage to store files in local storage.
let upload = multer({ storage });

router.post("/upload", upload.single("myFile"), async (req, res) => {
  try {
    if (!req.file)
      return res.status(400).json({ message: "Please upload the file" });
    console.log(req.file);

    let uploadedFile: UploadApiResponse;
    try {
      uploadedFile = await cloudinary.uploader.upload(req.file.path, {
        folder: "Share Files",
        resource_type: "auto",
      });
    } catch (error: any) {
      console.log(error.message);
      return res.status(400).json({ message: "Cloudinary Error" });
    }

    const { originalname } = req.file;
    const { secure_url, bytes, format } = uploadedFile;

    const file = await File.create({
      filename: originalname,
      sizeInBytes: bytes,
      secure_url,
      format,
    });
    //sending data back to client side.
    res.status(200).json({
      id: file._id,
      downloadPageLink: `${process.env.API_BASE_ENDPOINT_CLIENT}download/${file._id}`,
    });
  } catch (error: any) {
    console.log(error.message);
    res.status(500).json({ message: "Server Error" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const file = await File.findById(id);
    if (!file) return res.status(404).json({ message: "File does not exist" });
    const { filename, format, sizeInBytes } = file;
    return res.status(200).json({
      name: filename,
      sizeInBytes: sizeInBytes,
      format: format,
      id: id,
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
});

router.get("/:id/download", async (req, res) => {
  try {
    const id = req.params.id;
    const file = await File.findById(id);
    if (!file) return res.status(404).json({ message: "File does not exist" });
    //fileStream.pipe(res) is to make the file downloadable.
    https.get(file.secure_url, (fileStream) => fileStream.pipe(res));
  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
});

export default router;
