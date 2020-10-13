const storeForm = document.getElementById("store-form");
const storeId = document.getElementById("store-id");
const storeAddress = document.getElementById("store-address");

// send post to API to add store
async function addStore(e) {
    e.preventDefault();
    if (storeId.value === "" || storeAddress.value === "") {
        alert("please fill in fields");
    }

    const sendBody = {
        storeId: storeId.value,
        address: storeAddress.value,
    };

    try {
        const res = await fetch("/api/v1/stores", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(sendBody),
        });
        if (res.status === 400) {
            throw Error("Store ID exists");
        }
        console.log("store Added!");
        window.location.href = "/index.html";
    } catch (e) {
        console.error(e);
        return;
    }
}

storeForm.addEventListener("submit", addStore);
