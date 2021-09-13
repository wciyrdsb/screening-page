function emailPrompt(defaultValue) {

    // Send Prompt
    let result = prompt(
        "What do you want your e-mail to be?", defaultValue
    );

    if (result === "")
        return null;

    if (result == null)
        return undefined;

    // Validate Email
    if (!validEmail(result)) {
        alert("Input must be a valid email or empty, please try again.");
        return emailPrompt(defaultValue);
    }

    return result;

}

function namePrompt(defaultValue) {

    // Send Prompt
    let result = prompt(
        "What do you want your new name to be?", defaultValue
    );

    if (result === "")
        return null;

    if (result == null)
        return undefined;

    // Validate Name
    if (!result.includes(" ") || result.trim() === "") {
        alert("Input must be a real name, including your first and last name. Try again.");
        return namePrompt(defaultValue);
    }

    return result;
}

function symptomPrompt(defaultValue) {

    // Send Prompt
    let result = prompt(
        "Did you answer yes to any of the self-screening questions (if so, you can't come to school)?", defaultValue
    );

    if (result === "")
        return null;

    if (result == null)
        return undefined;

    // Validate Answer
    if (!["true", "false", "yes", "no"].includes(result.toLowerCase())) {
        alert("Input must be one of the following (case insensitive):\n\n- True/False\n- Yes/No\n\nPlease try again, thank you!");
        return symptomPrompt(defaultValue);
    }

    // return True/False based on reply
    return ["true", "yes"].includes(result.toLowerCase());

}

function textIfNull(variable) {
    if (variable === undefined) {
        return "<Cancelled Update>"
    }

    if (variable == null) {
        return "<Empty Value>"
    }

    return variable;
}

function getConfig() {
    return {
        email: {
            id: "emailAddress",
            value: Cookies.get("emailConfig")
        },
        name: {
            id: "entry.1548597311",
            value: Cookies.get("nameConfig")
        },
        symptoms: {
            id: "entry.614193284",
            value: Cookies.get("symptomConfig")
        }
    }
}

function validEmail(email) {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}

function editConfig(defaultEmail, defaultName, defaultSymptoms) {

    /*
    Undefined -> They cancelled
    Null -> They entered a null value
     */
    const email = emailPrompt(defaultEmail), name = namePrompt(defaultName), symptoms = symptomPrompt(defaultSymptoms);

    if (email !== undefined) Cookies.set("emailConfig", email || "");
    if (name !== undefined) Cookies.set('nameConfig', name || "");
    if (symptoms !== undefined) Cookies.set('symptomConfig', symptoms || "");

    alert(`
    You updated the following values:
    
    New E-Mail: ${textIfNull(email)}
    New Name: ${textIfNull(name)}
    Yes To Questions: ${textIfNull(symptoms)}
    
    Happy auto-filling, and good luck!
    `);

}

function autoFill() {
    let baseURL;

    const config = getConfig();
    const $oldFormEmbed = $("#googleFormEmbed");
    const $newFormEmbed = $oldFormEmbed.clone();
    const $autoFillButton = $("#autoFill");
    const newFormElement = $newFormEmbed.get(0);
    const autoFillElement = $autoFillButton.get(0);

    /**
     * Disable this button to prevent spam
     */
    {
        // Initial
        autoFillElement.disabled = true;
        autoFillElement.style.background = "rgb(76,40,141)";
    }

    /**
     * Generate filled form URL
     */
    {
        baseURL = "https://docs.google.com/forms/d/e/1FAIpQLSf9WPvtith7cAvAc-CSwJRadcNBT7vPNNqMzE2zaN66B70WPQ/viewform?embedded=true&usp=pp_url&srd=true";
        baseURL += ("&" + config.name.id + "=" + encodeURIComponent(config.name.value || ""));
        baseURL += ("&" + config.email.id + "=" + encodeURIComponent(config.email.value || ""));

        if (config.symptoms.value !== null && config.symptoms.value !== undefined) {
            let symptoms = encodeURIComponent(
                config.symptoms.value === "true" ?
                    "Yes, I answered yes to one or more of the statements" :
                    "No, I did not answer yes to any of the statements."
            )
            baseURL += "&" + config.symptoms.id + "=" + symptoms;
        }

    }

    /**
     * Create new form & handle smoother animations
     */
    {

        // New SRC (Replaced with auto-fill URL)
        $newFormEmbed.attr("src", baseURL);

        // Hide for now
        newFormElement.style.height = "0";
        newFormElement.style.width = "0";
        newFormElement.style.display = "none";

        // When it loads
        $newFormEmbed.on("load", () => {
            $oldFormEmbed.remove();
            newFormElement.style.height = null;
            newFormElement.style.width = null;
            newFormElement.style.display = null;

            // Unpause the button
            setTimeout(() => {
                autoFillElement.disabled = false;
                autoFillElement.style.backgroundColor = null;
            }, 200);

        })

    }

    /**
     * Replace Google Form
     */
    $oldFormEmbed.get(0).parentNode.appendChild($newFormEmbed.get(0));
}

