exports.uploadFile = async (req, res, bucket) => {
  if (!req.file) {
    return res.status(400).send("No file uploaded.");
  }

  const file = req.file;
  const fileName = `${Date.now()}-${file.originalname}`;
  const fileUpload = bucket.file(fileName);

  const blobStream = fileUpload.createWriteStream({
    metadata: {
      contentType: file.mimetype,
    },
  });

  blobStream.on("error", (error) => {
    res.status(500).send({ message: "Upload failed", error });
  });

  blobStream.on("finish", async () => {
    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileUpload.name}`;
    res
      .status(200)
      .send({ message: "File uploaded successfully", url: publicUrl });
  });

  blobStream.end(file.buffer);
};
