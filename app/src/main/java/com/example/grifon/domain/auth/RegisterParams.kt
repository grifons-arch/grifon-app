package com.example.grifon.domain.auth

data class RegisterParams(
    val email: String,
    val passwd: String,
    val socialTitle: String? = null,
    val firstName: String,
    val lastName: String,
    val countryIso: String,
    val street: String,
    val city: String,
    val postalCode: String,
    val phone: String? = null,
    val company: String? = null,
    val vatNumber: String? = null,
    val iban: String? = null,
    val customerDataPrivacyAccepted: Boolean = false,
    val newsletter: Boolean = false,
    val termsAndPrivacyAccepted: Boolean = false,
    val partnerOffers: Boolean? = null,
)
