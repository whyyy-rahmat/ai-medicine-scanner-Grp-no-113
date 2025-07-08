console.log("app.js loaded");

function getmedicineFromURL() {
    const params = new URLSearchParams(window.location.search);
    return params.get("medicine");
}

const searchBtn = document.getElementById('search-button');
if(searchBtn)   {
      searchBtn.addEventListener("click",function (e) {
       e.preventDefault();
    const input = document.getElementById('medicine-input').value.trim();
    if(!input){
        alert("please enter a medicine name");
        return;
    }
    window.location.href =`result.html?medicine=${encodeURIComponent(input)}`;
});
}
      async function fetchmedicineInfo(medicineName) {
        const resultBox = document.getElementById('result')
        resultBox.innerHTML = "<p>Loading...</p>";


    try {
        const URL1 = `https://api.fda.gov/drug/event.json?search=patient.drug.medicinalproduct:${medicineName}&limit=`;

        const URL2 =`https://rxnav.nlm.nih.gov/REST/drugs.json?name=${medicineName}`;

        const [res1, res2] = await Promise.all ([
            fetch(URL1),
            fetch(URL2),
        ]);

        const data1 = await res1.json();
        const data2 = await res2.json();

        console.log("FDA Data:", data1);
        console.log("RxNorm Data:", data2);
        console.log("user medicineName:", medicineName);
        


        
        // FDA Reaction Details
        if (data1.results && data1.results.length > 0) {
            const reaction = data1.results[0].patient.reaction[0].reactionmeddrapt;
            resultBox.innerHTML += `<p><strong>Possible Reaction:</strong> ${reaction}</p>`;
        } else {
            resultBox.innerHTML += `<p>No FDA reaction data found.</p>`;
        }

        // RxNorm drug name
        if (data2.drugGroup && data2.drugGroup.conceptGroup) {
            const name = data2.drugGroup.conceptGroup[0]?.conceptProperties?.[0]?.name;
            if (name) {
                resultBox.innerHTML += `<p><strong>RxNorm Name:</strong> ${name}</p>`;
            } else {
                resultBox.innerHTML += `<p>No RxNorm drug name found.</p>`;
            }
        } else {
            resultBox.innerHTML += `<p>No RxNorm data found.</p>`;
        }
        
        
        //FDA Drug Label Data for More Info (Uses, Dosage, Side-effects, Benefits)
try {
    const labelRes = await fetch(`https://api.fda.gov/drug/label.json?search=active_ingredient:${medicineName}&limit=1`);
    const labelData = await labelRes.json();

    if (labelData.results && labelData.results.length > 0) {
        const med = labelData.results[0];
        const uses = med.indications_and_usage?.[0] || "Not available";
        const dosage = med.dosage_and_administration?.[0] || "Not available";
        const sideEffects = med.adverse_reactions?.[0] || "Not available";
        const benefits = med.clinical_studies?.[0] || "Not available";

        resultBox.innerHTML += `
            <hr>
            <p><strong>Uses:</strong> ${uses}</p>
            <p><strong>Dosage:</strong> ${dosage}</p>
            <p><strong>Side Effects:</strong> ${sideEffects}</p>
            <p><strong>Benefits:</strong> ${benefits}</p>
        `;
    } else {
        resultBox.innerHTML += `<p>No extended info found from drug label.</p>`;
    }
} catch (err) {
    console.error("Error fetching extended label info:", err);
}
}
    catch (error) {
        console.error("Error in API calls:", error);
    }    
    
}


async function fetchFromXML(medicineName) {
  const resultBox = document.getElementById('result');
  resultBox.innerHTML = "Loading from local database...";

  try {
    const res = await fetch("medicine.xml");
    const xmlText = await res.text();

    const parser = new DOMParser();
    const xml = parser.parseFromString(xmlText, "application/xml");
    const rows = xml.getElementsByTagName("row");

    let found = false;

    for (let row of rows) {
      const name = row.querySelector('field[name="Name"]').textContent.toLowerCase();
      if (name === medicineName.toLowerCase()) {
        const strength = row.querySelector('field[name="Strength"]').textContent;
        const generic = row.querySelector('field[name="GenericName"]').textContent;
        const form = row.querySelector('field[name="Form"]').textContent;
        const manu = row.querySelector('field[name="Manufacturer"]').textContent;
        const cat = row.querySelector('field[name="Category"]').textContent;
        const desc = row.querySelector('field[name="Description"]').textContent;

        resultBox.innerHTML = `
          <p><strong>Generic Name:</strong> ${generic}</p>
          <p><strong>Strength:</strong> ${strength}</p>
          <p><strong>Form:</strong> ${form}</p>
          <p><strong>Manufacturer:</strong> ${manu}</p>
          <p><strong>Category:</strong> ${cat}</p>
          <p><strong>Description:</strong> ${desc}</p>
        `;
        found = true;
        break;
      }
    }

    if (!found) {
      resultBox.innerHTML = "Medicine not found ";
    }

  } catch (err) {
    resultBox.innerHTML = "Error loading local database.";
    console.error(err);
  }
}


//result.html

const medicineName = getmedicineFromURL();
if (medicineName) {
    document.getElementById("medicine-heading").innerText = medicineName;
    fetchmedicineInfo(medicineName);
} else {
  document.getElementById('result').innerHTML = "No medicine specified.";
}
 

//barcode


const barcodeMap = {
  "12345670": "paracetamol"
};

// scan button

document.getElementById("scan-button").addEventListener("click", function (e) {
    e.preventDefault();
  console.log("Scan button clicked");

  //uagga.stop(); // In case it was running before

  Quagga.init({
    inputStream: {
      name: "Live",
      type: "LiveStream",
      target: document.querySelector("#barcode-scanner"),
      constraints: {
        facingMode: "environment"
      }
    },
    decoder: {
      readers: ["ean_reader", "ean_8_reader", "code_128_reader"]
    },
    locate: true
  }, function (err) {
    if (err) {
      console.error("Quagga init error:", err);
      return;
    }
    console.log("scanner started");
    Quagga.start();
  });

  Quagga.onDetected(function (data) {
    const code = data.codeResult.code;
    console.log("📸 Scanned barcode:", code);

    const medicine = barcodeMap[code];
    if (medicine) {
      console.log("Matched:", medicine);
      Quagga.stop();
      window.location.href = `result.html?medicine=${encodeURIComponent(medicine)}`;
    } else {
      console.log("Not matched in barcodeMap");
      Quagga.stop();
      alert("Barcode not recognized.");
      document.getElementById("medicine-input").value = code;
    }
  });
});



function fetchFromXML(medicineName) {
  const resultBox = document.getElementById("result");

  fetch("medicine.xml")
    .then(response => response.text())
    .then(str => {
      const parser = new DOMParser();
      const xml = parser.parseFromString(str, "application/xml");

      const rows = xml.getElementsByTagName("row");
      let found = false;

      for (let i = 0; i < rows.length; i++) {
        const name = rows[i].querySelector('[name="Name"]')?.textContent.trim().toLowerCase();

        if (name === medicineName.toLowerCase()) {
          const generic = rows[i].querySelector('[name="GenericName"]')?.textContent || "N/A";
          const strength = rows[i].querySelector('[name="Strength"]')?.textContent || "N/A";
          const form = rows[i].querySelector('[name="Form"]')?.textContent || "N/A";
          const manu = rows[i].querySelector('[name="Manufacturer"]')?.textContent || "N/A";
          const category = rows[i].querySelector('[name="Category"]')?.textContent || "N/A";
          const desc = rows[i].querySelector('[name="Description"]')?.textContent || "N/A";

          resultBox.innerHTML = `
            <p><strong>Generic Name:</strong> ${generic}</p>
            <p><strong>Strength:</strong> ${strength}</p>
            <p><strong>Form:</strong> ${form}</p>
            <p><strong>Manufacturer:</strong> ${manu}</p>
            <p><strong>Category:</strong> ${category}</p>
            <p><strong>Description:</strong> ${desc}</p>
          `;
          found = true;
          break;
        }
      }

      return true;
    })
    .catch(err => {
      console.error("Error loading XML:", err);
      resultBox.innerHTML = "Failed to load medicine data.";
      return false;
    });
}
function fetchMedicineInfo(medicineName) {
  fetchmedicineInfo(medicineName).then(found => {
    if (!found) {
      fetchmedicineInfo(medicineName); 
    }
  });
}
