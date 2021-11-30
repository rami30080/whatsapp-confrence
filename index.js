
const qrcode = require('qrcode-terminal');
const { Client } = require('whatsapp-web.js');

const express = require("express");
//const {google} = require("googleapis");

const app = express();
// File handling package
const fs = require('fs');
// Google sheet npm package

const { GoogleSpreadsheet } = require('google-spreadsheet');
const SESSION_FILE_PATH = './session.json';
let sessionData;
if(fs.existsSync(SESSION_FILE_PATH)) {
    sessionData = require(SESSION_FILE_PATH);
}


//Jouana's Wedding
const RESPONSES_SHEET_ID = '1o9VvBhoOWfOWxLpOeZjcsnSFE6wNhiAB0-YxO7Q1uJk';
//Test
//const RESPONSES_SHEET_ID = '18JVgCtNrC5CIdf49zU_u-GUT5v8BCoGm0D_XMTdUkxI';


// Create a new document
const doc = new GoogleSpreadsheet(RESPONSES_SHEET_ID);

// Credentials for the service account
const CREDENTIALS = JSON.parse(fs.readFileSync('credentials.json'));
var arr = [];

const updateRow = async (keyValue, oldValue, newValue) => {

    // use service account creds
    await doc.useServiceAccountAuth({
        client_email: CREDENTIALS.client_email,
        private_key: CREDENTIALS.private_key
    });

    await doc.loadInfo();

    // Index of the sheet
    let sheet = doc.sheetsByIndex[0];

    let rows = await sheet.getRows();

    let date_ob = new Date();

    let date = ("0" + date_ob.getDate()).slice(-2);

// current month
let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);

// current year
let year = date_ob.getFullYear();

// current hours
let hours = date_ob.getHours();

// current minutes
let minutes = date_ob.getMinutes();

// current seconds
let seconds = date_ob.getSeconds();

// prints date & time in YYYY-MM-DD HH:MM:SS format
console.log(month + "/" + date + "/" + year + " " + hours + ":" + minutes + ":" + seconds);


    for (let index = 0; index < rows.length; index++) {
        const row = rows[index];
        if (row[keyValue] === oldValue) {
            rows[index]['answer'] = newValue;
            rows[index]['date']=month + "/" + date + "/" + year + " " + hours + ":" + minutes + ":" + seconds;
            await rows[index].save();
            break; 
        }
    };
};
const getRows = async (number) => {

  // use service account creds
  await doc.useServiceAccountAuth({
      client_email: CREDENTIALS.client_email,
      private_key: CREDENTIALS.private_key
  });

  // load the documents info
  await doc.loadInfo();

  // Index of the sheet
  let sheet = doc.sheetsByIndex[0];

  // Get all the rows
  let rows = await sheet.getRows();

  return rows;
};
const Msgs =async (msg)=>{
    console.log('MESSAGE RECEIVED', msg.from.slice(0,12),' ',msg.body);
    var res = msg.body.replace(/\D/g, "");
    let isnum = /^\d+$/.test(msg.body);
    if(isnum)
    {
        
        if(Number(res)<2){
        await updateRow('number',msg.from.slice(0,12),res)
        await doc.useServiceAccountAuth({
            client_email: CREDENTIALS.client_email,
            private_key: CREDENTIALS.private_key
        });
      
        // load the documents info
        await doc.loadInfo();
      
        // Index of the sheet
        let sheet = doc.sheetsByIndex[0];
      
        // Get all the rows
        let rows = await sheet.getRows();
      
        for (let index = 0; index < rows.length; index++) {
            const row = rows[index];
            
            if(row.number==msg.from.slice(0,12)){
                if(Number(row.answer)>0){
                await client.sendMessage(msg.from.slice(0,12)+"@c.us","شكراً لردك، نسعد لمشاركتك معنا.\nمرفق رابط الوصول لموقع المؤتمر\n\nUse Waze to drive to מלון רמדה אוליביה נצרת Ramada Nazareth: \nhttps://waze.com/ul/hsvc4593wf")  
                      }else{
                        await client.sendMessage(msg.from.slice(0,12)+"@c.us","شكراً لردك، نأمل مشاركتك في برامج ونشاطات مستقبلاً.")
                      }
                    }
        };
    }else{
        await client.sendMessage(msg.from.slice(0,12)+"@c.us","يتّغذر على البرنامج قراءة معطيات خارج البرمجة! \nنرجو الرد: 1 او 0\n\nباحترام،\nتطبيق جايين")
    }
        
    }else{
        await doc.useServiceAccountAuth({
            client_email: CREDENTIALS.client_email,
            private_key: CREDENTIALS.private_key
        });
      
        // load the documents info
        await doc.loadInfo();
      
        // Index of the sheet
        let sheet = doc.sheetsByIndex[0];
      
        // Get all the rows
        let rows = await sheet.getRows();

        for (let index = 0; index < rows.length; index++) {
            const row = rows[index];
            
            if(row.number==msg.from.slice(0,12)){
                // if(row['date'].length>0){
                //     break;
                //       }else{
                        await client.sendMessage(msg.from.slice(0,12)+"@c.us","يتّغذر على البرنامج قراءة معطيات خارج البرمجة! \nنرجو الرد: 1 او 0\n\nباحترام،\nتطبيق جايين")
                    // }
                    }
        };
        

    }
    
}

const client = new Client({
    session: sessionData
});

client.on('qr', qr => {
    qrcode.generate(qr, {small: true});
});

// Save session values to the file upon successful auth
// client.on('authenticated', (session) => {
//     sessionData = session;
//     fs.writeFile(SESSION_FILE_PATH, JSON.stringify(session), (err) => {
//         if (err) {
//             console.error(err);
//         }
//     });
// });

client.on('ready', async() => {

    console.log('Client is ready!');
    
    
    app.get("/sendInvitation", async(req, res) => {
        
        // use service account creds
        await doc.useServiceAccountAuth({
            client_email: CREDENTIALS.client_email,
            private_key: CREDENTIALS.private_key
        });
      
        // load the documents info
        await doc.loadInfo();
      
        // Index of the sheet
        let sheet = doc.sheetsByIndex[0];
      
        // Get all the rows
        let rows = await sheet.getRows();
      
        for (let index = 0; index < rows.length; index++) {
            const row = rows[index];
            if(row.number.length>0&&Number(row.sent)==0){
                    rows[index]['sent'] = 1;
                    await rows[index].save();
            await client.sendMessage(row.number+"@c.us","حضرة "+row.name+",\nاستمرارًا لتسجيلكم..\nيسر المركز العربي للتخطيط البديل\nمشاركتك في اعمال المؤتمر الـ 20 حول قضايا الأرض والمسكن..\nوذلك يوم الثلاثاء 30.11.2021، الساعة 9:30، في فندق رمادا - الناصرة.\nلتأكيد المشاركة الرجاء الرد بـ ارسال الرقم 1\nفي حال عدم تمكنك من المشاركة الرجاء الرد بـ ارسال الرقم 0\n\nنتمنى مشاركتك معنا في برامج ونشاطات المركز\n\nباحترام \nالمركز العربي للتخطيط البديل");

            }
        };
        console.log('sendMessage Sent!');

        res.send('sendMessage Sent!');
    });

    app.get("/reminderToAnswer", async(req, res) => {
        
        // use service account creds
        await doc.useServiceAccountAuth({
            client_email: CREDENTIALS.client_email,
            private_key: CREDENTIALS.private_key
        });
      
        // load the documents info
        await doc.loadInfo();
      
        // Index of the sheet
        let sheet = doc.sheetsByIndex[0];
      
        // Get all the rows
        let rows = await sheet.getRows();
      
        for (let index = 0; index < rows.length; index++) {
            const row = rows[index];
            if(row.number.length>0&&Number(row.sent)==0){
                    rows[index]['sent'] = 1;
                    await rows[index].save();
            await client.sendMessage(row.number+"@c.us","البرنامج المحوسب بانتظار ردكم بخصوص المشاركة بفرحة عروستنا جوانة رمزي نصرالله، \nنرجو ارسال: \nفي حال تعذركم عن المشاركة - ارسال الرقم 0 \nمشارك واحد - ارسال الرقم 1 \nمشاركين اثنين - ارسال الرقم 2 \nوما الى ذلك…\nنرجو لكم سهرة مميزة وليلة انيسة");

            }
        };
        console.log('sendMessage Sent!');

        res.send('sendMessage Sent!');
    });

    app.get("/tableMessage", async(req, res) => {
        
        // use service account creds
        await doc.useServiceAccountAuth({
            client_email: CREDENTIALS.client_email,
            private_key: CREDENTIALS.private_key
        });
      
        // load the documents info
        await doc.loadInfo();
      
        // Index of the sheet
        let sheet = doc.sheetsByIndex[0];
      
        // Get all the rows
        let rows = await sheet.getRows();
      
        for (let index = 0; index < rows.length; index++) {
            const row = rows[index];
            if(row.number.length>0&&((Number(row.answer)>0))&&(Number(row.table)>0||row.table.includes("+"))&&Number(row.tsent)==0){
                rows[index]['tsent'] = 1;
                await rows[index].save();
            await client.sendMessage(row.number+"@c.us","للتسهيل عليكم، نعلمكم بان رقم طاولتكم في سهرة عروستنا جوانة هو ("+row.table+").\nنلتقي لنفرح سوياً")
            }
        };
        console.log('tableMessage Sent!');

        res.send('tableMessage Sent!');
    });

    app.get("/remindMessage", async(req, res) => {
        
        // use service account creds
        await doc.useServiceAccountAuth({
            client_email: CREDENTIALS.client_email,
            private_key: CREDENTIALS.private_key
        });
      
        // load the documents info
        await doc.loadInfo();
      
        // Index of the sheet
        let sheet = doc.sheetsByIndex[0];
      
        // Get all the rows
        let rows = await sheet.getRows();
      
        for (let index = 0; index < rows.length; index++) {
            const row = rows[index];
            if(row.number.length>0&&row.date.length<1&&Number(row.rsent)==0){
                rows[index]['rsent'] = 1;
                await rows[index].save();
            await client.sendMessage(row.number+"@c.us",`البرنامج بنتظر ردك،\nهل ستشارك في مؤتمر ال - 20 للمركز العربي للتخطيط البديل يوم غد الثلاثاء الموافق 30/11/2021 تمام الساعة 9:30\nصباحاً في فندق رمادا الناصرة حول قضيا الارض والمسكن.\nلتأكيد المشاركة نرجو ارسال رقم 1 للتعذر نرجو ارسال رقم 0`)
            }
        };
        console.log('remindMessage Sent!');

        res.send('remindMessage Sent!');
    });

});

client.on('message', async msg => {
     //await new Promise(async(resolve, reject) => {await Msgs(msg)}).catch((err)=>{console.log(err)})
     await test(msg).then(function(result){
        console.log('MESSAGE RECEIVED after Promise', msg.from,' ',msg.body);
     })
});

const test=function(msg){
    console.log('MESSAGE RECEIVED', msg.from,' ',msg.body);
    return new Promise(function(resolve,reject){
            if(true){
        resolve(msg.reply("سيتواصل معك الطاقم باقرب وقت\n\nباحترام\nتطبيق جايين"));
        }

    })
}

client.initialize();

app.listen(1337,(req,res)=>console.log("running on 1337"));