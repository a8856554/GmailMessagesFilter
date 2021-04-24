function applyExtraSetup(sequelize,db) {
	
    let GmailTokens = db["GmailTokens"].model;
    let Users = db["Users"].model;
    let UserMails = db["UserMails"].model;
    // GmailTokens has a UserId column which stores Users id
    // target = Users
    GmailTokens.belongsTo(Users); // 屬於

    // UserMails has a UserId column which stores Users id
    // target = Users
    UserMails.belongsTo(Users);
}

module.exports = { applyExtraSetup };