function applyExtraSetup(sequelize,db) {
	//const { Users, GmailTokens } = sequelize.models;

	// GmailTokens has a UsersId column which stores Users id
    // target = Users
    let GmailTokens = db["GmailTokens"].model;
    let Users = db["Users"].model;
    GmailTokens.belongsTo(Users) // 屬於
    
    
}

module.exports = { applyExtraSetup };