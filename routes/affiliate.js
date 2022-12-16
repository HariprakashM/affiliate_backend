const express = require("express");
const router = express.Router();
const { Engine } = require("json-rules-engine");
const getCustomerById = require("../affiliate/getCustomerById");

const Affiliate = require("../model/affiliateSchema");
const Order = require("../model/orderSchema");
const User = require("../model/userSchema");
const Referral = require("../model/referralSchema");

const date = require("date-and-time");

router.post("/register-affiliate", async function (req, res) {
  var result = req.body.meta_data.find((item) => item.key === "join_comp_plan");
  // console.log(result)
  try {
    if (result !== undefined) {
      var result = req.body.meta_data.find(
        (item) => item.key === "reffered-by"
      );
      // console.log(result)
      const affiliateData = {
        affiliate_name: req.body.username,
        affiliate_id: req.body.id,
        affiliate_url:
          "https://woocommerce-585793-1896812.cloudwaysapps.com/go/Developer/",
        refered_by: result.value,
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        full_name: `${req.body.first_name} ${req.body.last_name}`,
      };
      const newAffiliate = new Affiliate(affiliateData);
      await newAffiliate.save();
      const newUser = new User(req.body);
      await newUser.save();
      res.json({ message: "Affiliate Registered Successfully" });
    } else {
      const newUser = new User(req.body);
      await newUser.save();
      res.json({ message: "User Registered Successfully" });
    }
  } catch (error) {
    res.json({ message: "Registration Failed" });
  }
});

router.post("/order", async function (req, res) {
  try {
    //order detail addition and updation//
    const newOrder = await Order.findOne({ id: req.body.id });
    if (newOrder) {
      const orderDetails = await Order.updateOne(
        { id: req.body.id },
        {
          $set: req.body,
        }
      );
      res.json({ message: "order updation success" });
    } else {
      const orderDetails = new Order(req.body);
      await orderDetails.save();
      res.json({ message: "order addition success" });
    }
  } catch (error) {
    res.json({ message: "order addition/updation Failed" });
  }
});

router.post("/order-affiliate", async function (req, res) {
  // console.log(req.body)
  await getCustomerById(req)
    .then(async (data) => {
      console.log(data);
      var result = data.meta_data.find((item) => item.key === "reffered-by");
      console.log(result);
      if (result.value !== "") {
        if (req.body.status == "on-hold") {
          const now = new Date();
          const orderDate = date.format(now, "MMM DD,YYYY");
          const productsUnSort = req.body.line_items.map((e) => e.name);
          const productsSort = productsUnSort.map((e) =>
            e.replace("<strong>", "").replace("</strong>", "")
          );
          const productsStr = productsSort.join(", ");

          const affiliateData = await Affiliate.findOne({
            affiliate_name: result.value,
          });
          console.log("affData====>", affiliateData);
          const walletAmount= (
            parseFloat(req.body.total - req.body.shipping_total) * 0.05
          ).toFixed(2);
          const wallet=Number(walletAmount)
          // const earData = {
          //   user_name: data.username,
          //   order_id: req.body.id,
          //   order_total: parseFloat(req.body.total),
          //   commission_amount: parseFloat(walletAmount),
          //   status: req.body.status,
          //   reason: "",
          // };
          // affiliateData.earnings_by_referals.push(earData);
          affiliateData.unpaid_earnings =
            (affiliateData.unpaid_earnings + parseFloat(wallet)).toFixed(2);
          affiliateData.unpaid_referals += 1;
          await affiliateData.save();
          console.log("Affiliate==>",affiliateData);
          const refData = {
            referral_id: req.body.customer_id,
            amount: wallet,
            affiliate_name: affiliateData.affiliate_name,
            reference: req.body.id,
            description: productsStr,
            payout_method: req.body.payment_method,
            date: orderDate,
            status: req.body.status,
          };
          const newReferral = new Referral(refData);
          await newReferral.save();
          console.log("Referral==>", newReferral);
          res.json({
            message: "unpaid earnings & referral added Successfully",
          });
        } else if (req.body.status == "completed") {
          const affiliateData = await Affiliate.findOne({
            affiliate_name: result.value,
          });

          console.log(req.body.status);
          const walletAmount = (
            parseFloat(req.body.total - req.body.shipping_total) * 0.05
          ).toFixed(2);
          const wallet=Number(walletAmount)

          affiliateData.unpaid_earnings = (
            affiliateData.unpaid_earnings - parseFloat(wallet)
          ).toFixed(2);
          affiliateData.paid_earnings = (
            affiliateData.paid_earnings + parseFloat(wallet)
          ).toFixed(2);
          affiliateData.wallet = affiliateData.paid_earnings;

          affiliateData.unpaid_referals -= 1;
          affiliateData.paid_referals += 1;

          await affiliateData.save();

          await Referral.updateOne(
            {
              reference: req.body.id
            },
            {
              $set: {
                "status": req.body.status,
              },
            }
          );

          // await Affiliate.updateOne(
          //   {
          //     affiliate_name: result.value,
          //     "earnings_by_referals.order_id": req.body.id,
          //   },
          //   {
          //     $set: {
          //       "earnings_by_referals.$.status": req.body.status,
          //     },
          //   }
          // );

          // console.log(affiliateData);

          // userData.orders.push(req.body);
          // await userData.save();
          // console.log(userData);

          res.json({ message: "wallet added Successfully" });
        } else if (req.body.status == "cancelled") {
          const affiliateData = await Affiliate.findOne({
            affiliate_name: result.value,
          });
          const walletAmount = (
            parseFloat(req.body.total - req.body.shipping_total) * 0.05
          ).toFixed(2);
          const wallet=Number(walletAmount);

          affiliateData.unpaid_earnings = (
            affiliateData.unpaid_earnings + parseFloat(wallet)
          ).toFixed(2);
          affiliateData.paid_earnings = (
            affiliateData.paid_earnings - parseFloat(wallet)
          ).toFixed(2);
          affiliateData.wallet = affiliateData.paid_earnings;

          affiliateData.unpaid_referals += 1;
          affiliateData.paid_referals -= 1;

          await affiliateData.save();
          console.log(affiliateData);
          await Referral.updateOne(
            {
              reference: req.body.id
            },
            {
              $set: {
                "status": req.body.status,
              },
            }
          );
          res.json({
            message: "order canceled and affiliate  updated Successfully",
          });
        }
      } else {
        res.json({ message: "not referred by affiliate" });
      }
    })
    .catch((error) => {
      console.log(error);
      throw error;
    });
});

router.get("/get-affiliates", async function (req, res) {
  try {
    const affiliates = await Affiliate.find();
    res.status(200).send(affiliates);
  } catch (error) {
    res.json({ message: "failed to get affiliates data" });
  }
});

router.get("/get-referrals", async function (req, res) {
  try {
    const referrals = await Referral.find();
    res.status(200).send(referrals);
  } catch (error) {
    res.json({ message: "failed to get referrals data" });
  }
});

// router.get("/test", async function (req, res) {
//   try {
//     const now = new Date();
//     var test = date.format(now, "MMM DD,YYYY");
//     console.log(test);
//     // const products=req.body.line_items.filter(e=>e.name)
//     const productsUnSort = req.body.line_items.map((e) => e.name);
//     const productsSort = productsUnSort.map((e) =>
//       e.replace("<strong>", "").replace("</strong>", "")
//     );
//     const productsStr = productsSort.join(", ");
//     console.log(productsStr);
//   } catch (error) {
//     res.json({ message: "failed to get referrals data" });
//   }
// });
module.exports = router;
