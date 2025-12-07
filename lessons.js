const router = require("express").Router();

const subjects = [
  "عربی", "ریاضی", "فارسی", "مطالعات اجتماعی", "دینی",
  "قرآن", "کار و فناوری", "تفکر", "زیست", "فیزیک", "شیمی", "هنر"
];

router.get("/", (req,res)=>{
  res.json(subjects);
});

module.exports = router;
