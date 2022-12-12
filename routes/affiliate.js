const express = require("express");
const router = express.Router();
const { Engine } = require("json-rules-engine");
const getCustomerById = require("../affiliate/getCustomerById");

const Affiliate = require("../model/affiliateSchema");
const Order = require("../model/orderSchema");
const User = require("../model/userSchema");

// router.post("/register-affiliate", async function (req, res) {
//   try {
//     if (req.body.agreeAffililate == "checked") {
//       const newAffiliate = new Affiliate(req.body);
//       await newAffiliate.save();
//       const newUser = new User(req.body);
//       await newUser.save();
//       res.json({ message: "Affiliate Registered Successfully" });
//     } else {
//       const newUser = new User(req.body);
//       await newUser.save();
//       res.json({ message: "User Registered Successfully" });
//     }
//   } catch (error) {
//     res.json({ message: "Registration Failed" });
//   }
// });

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
// router.post("/order-affiliate", async function (req, res) {
//   try {
//     if (req.body.referal_id !== null) {
//       const userData = await User.findOne({
//         refered_by: req.body.referal_id,
//         user_id: req.body.customer_id,
//       });

//       console.log(userData);

//       if (req.body.status == "on-hold") {
//         const affiliateData = await Affiliate.findOne({
//           user_name: userData.refered_by,
//         });
//         console.log(affiliateData);
//         const walletAmount = (
//           parseFloat(req.body.total - req.body.shipping_total) * 0.05
//         ).toFixed(2);
//         affiliateData.unpaid_earnings += parseFloat(walletAmount);
//         const earData = {
//           user_name: userData.user_name,
//           order_id: req.body.id,
//           order_total: parseFloat(req.body.total),
//           commission_amount: parseFloat(walletAmount),
//           status: req.body.status,
//         };
//         affiliateData.earnings_by_referals.push(earData);
//         await affiliateData.save();
//         console.log(affiliateData);
//         res.json({ message: "unpaid earnings added Successfully" });
//       } else if (req.body.status == "completed") {
//         const affiliateData = await Affiliate.findOne({
//           user_name: userData.refered_by,
//         });

//         console.log(req.body.status);
//         const walletAmount = (
//           parseFloat(req.body.total - req.body.shipping_total) * 0.05
//         ).toFixed(2);

//         affiliateData.unpaid_earnings =
//           affiliateData.unpaid_earnings - parseFloat(walletAmount);
//         affiliateData.paid_earnings =
//           affiliateData.paid_earnings + parseFloat(walletAmount);
//         affiliateData.wallet = affiliateData.paid_earnings;

//         await affiliateData.save();

//         await Affiliate.updateOne(
//           {
//             user_name: req.body.referal_id,
//             "earnings_by_referals.order_id": req.body.id,
//           },
//           {
//             $set: {
//               "earnings_by_referals.$.status": req.body.status,
//             },
//           }
//         );

//         console.log(affiliateData);

//         // userData.orders.push(req.body);
//         // await userData.save();
//         // console.log(userData);

//         res.json({ message: "wallet added Successfully" });
//       } else if (req.body.status == "canceled") {
//         const affiliateData = await Affiliate.findOne({
//           user_name: userData.refered_by,
//         });
//         const affOrder = affiliateData.earnings_by_referals.find(
//           (e) => e.order_id == req.body.id
//         );

//         affiliateData.paid_earnings =
//           affiliateData.paid_earnings - affOrder.commission_amount;
//         affiliateData.wallet = affiliateData.paid_earnings;
//         await Affiliate.updateOne(
//           {
//             user_name: req.body.referal_id,
//             "earnings_by_referals.order_id": req.body.id,
//           },
//           {
//             $set: {
//               "earnings_by_referals.$.status": req.body.status,
//               "earnings_by_referals.$.commission_amount": affiliateData.wallet,
//             },
//           }
//         );
//         await affiliateData.save();
//         console.log(affiliateData);
//         res.json({
//           message: "order canceled and affiliate updated Successfully",
//         });
//       }
//     } else {
//       res.json({ message: "not an affiliate" });
//     }
//   } catch (error) {
//     res.json({ message: "Not found" });
//   }
// });

router.post("/order-affiliate", async function (req, res) {
  // console.log(req.body)
  await getCustomerById(req)
    .then(async (data) => {
      console.log(data);
      var result = data.meta_data.find((item) => item.key === "reffered-by");
      console.log(result);
      if (result.value !== "") {
        if (req.body.status == "on-hold") {
          const affiliateData = await Affiliate.findOne({
            affiliate_name: result.value,
          });
          console.log(affiliateData);
          const walletAmount = (
            parseFloat(req.body.total - req.body.shipping_total) * 0.05
          ).toFixed(2);
          affiliateData.unpaid_earnings += parseFloat(walletAmount);
          const earData = {
            user_name: data.user_name,
            order_id: req.body.id,
            order_total: parseFloat(req.body.total),
            commission_amount: parseFloat(walletAmount),
            status: req.body.status,
          };
          affiliateData.earnings_by_referals.push(earData);
          await affiliateData.save();
          console.log(affiliateData);
          res.json({ message: "unpaid earnings added Successfully" });
        } else if (req.body.status == "completed") {
          const affiliateData = await Affiliate.findOne({
            affiliate_name: result.value,
          });

          console.log(req.body.status);
          const walletAmount = (
            parseFloat(req.body.total - req.body.shipping_total) * 0.05
          ).toFixed(2);

          affiliateData.unpaid_earnings =
            affiliateData.unpaid_earnings - parseFloat(walletAmount);
          affiliateData.paid_earnings =
            affiliateData.paid_earnings + parseFloat(walletAmount);
          affiliateData.wallet = affiliateData.paid_earnings;

          await affiliateData.save();

          await Affiliate.updateOne(
            {
              affiliate_name: result.value,
              "earnings_by_referals.order_id": req.body.id,
            },
            {
              $set: {
                "earnings_by_referals.$.status": req.body.status,
              },
            }
          );

          console.log(affiliateData);

          // userData.orders.push(req.body);
          // await userData.save();
          // console.log(userData);

          res.json({ message: "wallet added Successfully" });
        } else if (req.body.status == "cancelled") {
          const affiliateData = await Affiliate.findOne({
            affiliate_name: result.value,
          });
          const affOrder = affiliateData.earnings_by_referals.find(
            (e) => e.order_id == req.body.id
          );

          affiliateData.paid_earnings =
            affiliateData.paid_earnings - affOrder.commission_amount;
          affiliateData.wallet = affiliateData.paid_earnings;
          await Affiliate.updateOne(
            {
              affiliate_name: result.value,
              "earnings_by_referals.order_id": req.body.id,
            },
            {
              $set: {
                "earnings_by_referals.$.status": req.body.status,
                "earnings_by_referals.$.commission_amount":
                  affiliateData.wallet,
              },
            }
          );
          await affiliateData.save();
          console.log(affiliateData);
          res.json({
            message: "order canceled and affiliate updated Successfully",
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
module.exports = router;
