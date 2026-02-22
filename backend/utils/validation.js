const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const isValidTime = (time) => /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]/.test(time);
const isValidDate = (dateString) => {
    const regEx = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateString.match(regEx)) return false;
    const dNum = new Date(dateString).getTime();
    return !!dNum || dNum === 0;
};

exports.validateRegistration = (data) => {
    const errors = [];
    if (!data.username || data.username.trim() === '' || data.username.length < 4) errors.push("Username must be at least 4 characters.");
    if (!data.userfullname || data.userfullname.trim() === '' || data.userfullname.length < 4) errors.push("Full name must be at least 4 characters.");
    if (!data.useremail || !isValidEmail(data.useremail) || data.useremail.length < 8) errors.push("Valid email is required and must be at least 8 characters.");
    if (!data.userpass || data.userpass.length < 8) errors.push("Password must be at least 8 characters.");
    if (!['client', 'trader'].includes(data.userrole)) errors.push("Invalid user role.");
    return { isValid: errors.length === 0, errors };
};

exports.validateProfile = (data) => {
    const errors = [];
    const ALLOWED_TRADES = ['Plumber', 'Electrician', 'Carpenter', 'Builder', 'Gardener'];
    const ALLOWED_REGIONS = ['London', 'Cardiff', 'Manchester', 'Birmingham', 'Leeds'];

    if (!ALLOWED_TRADES.includes(data.trade_type)) errors.push("Invalid trade type.");
    if (!ALLOWED_REGIONS.includes(data.city)) errors.push("Invalid region.");
    if (data.bio && data.bio.length > 500) errors.push("Bio must be under 500 characters.");
    if (!data.bio || data.bio.length < 10) errors.push("Bio text must be at least 10 characters.");
    if (!data.availability || data.availability.length < 10) errors.push("Availability text must be at least 10 characters.");
    return { isValid: errors.length === 0, errors };
};

exports.validateService = (data) => {
    const errors = [];
    if (!data.title || data.title.trim() === '' || data.title.length < 4) errors.push("Service title must be at least 4 characters.");
    if (!data.description || data.description.trim() === '' || data.description.length < 6) errors.push("Service description must be at least 6 characters.");
    const price = parseFloat(data.base_price);
    if (isNaN(price) || price < 0) errors.push("Base price must be a valid positive number.");
    if (!['Hourly', 'Fixed'].includes(data.price_type)) errors.push("Price type must be Hourly or Fixed.");
    return { isValid: errors.length === 0, errors };
};

exports.validateBooking = (data) => {
    const errors = [];
    if (!data.client_name || data.client_name.trim() === '' || data.client_name.length < 2) errors.push("Name must be at least 2 characters.");
    if (!data.client_email || !isValidEmail(data.client_email) || data.client_email.length < 8) errors.push("Valid email is required and must be at least 8 characters.");
    if (!data.job_date || !isValidDate(data.job_date)) errors.push("A valid job date (YYYY-MM-DD) is required.");
    if (!data.job_start_time || !isValidTime(data.job_start_time)) errors.push("Valid start time (HH:MM) is required.");
    if (!data.job_description || data.job_description.trim() === '' || data.job_description.length < 10) errors.push("Job description must be at least 10 characters.");
    return { isValid: errors.length === 0, errors };
};