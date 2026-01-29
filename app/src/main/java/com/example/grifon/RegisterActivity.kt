package com.example.grifon

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Visibility
import androidx.compose.material.icons.filled.VisibilityOff
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Checkbox
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.RadioButton
import androidx.compose.material3.Text
import androidx.compose.material3.TextField
import androidx.compose.material3.TextFieldDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.input.VisualTransformation
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.example.grifon.core.ServiceLocator
import com.example.grifon.presentation.register.RegisterStatus
import com.example.grifon.presentation.register.RegisterViewModel
import com.example.grifon.presentation.register.RegisterViewModelFactory
import com.example.grifon.ui.theme.GrifonTheme

class RegisterActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        setContent {
            GrifonTheme {
                RegisterScreen()
            }
        }
    }
}

@Composable
@OptIn(ExperimentalMaterial3Api::class)
private fun RegisterScreen(
    registerViewModel: RegisterViewModel = viewModel(
        factory = RegisterViewModelFactory(ServiceLocator.provideRegisterUseCase()),
    ),
) {
    val state by registerViewModel.uiState.collectAsState()
    val scrollState = rememberScrollState()
    var isPasswdVisible by remember { mutableStateOf(false) }
    var isPasswdConfirmationVisible by remember { mutableStateOf(false) }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(horizontal = 16.dp, vertical = 12.dp)
            .verticalScroll(scrollState),
        verticalArrangement = Arrangement.spacedBy(12.dp),
    ) {
        Text(
            text = "Εγγραφή",
            style = MaterialTheme.typography.headlineSmall.copy(fontWeight = FontWeight.SemiBold),
        )

        Row(
            modifier = Modifier.fillMaxWidth(),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            SocialTitleOption(
                label = "Κος",
                selected = state.socialTitle == "mr",
                onSelect = { registerViewModel.onSocialTitleChange("mr") },
            )
            Spacer(modifier = Modifier.width(12.dp))
            SocialTitleOption(
                label = "Κα",
                selected = state.socialTitle == "mrs",
                onSelect = { registerViewModel.onSocialTitleChange("mrs") },
            )
        }

        RegistrationTextField(
            value = state.firstName,
            onValueChange = registerViewModel::onFirstNameChange,
            placeholder = "Όνομα *",
        )
        RegistrationTextField(
            value = state.lastName,
            onValueChange = registerViewModel::onLastNameChange,
            placeholder = "Επώνυμο *",
        )
        RegistrationTextField(
            value = state.phone,
            onValueChange = registerViewModel::onPhoneChange,
            placeholder = "Τηλέφωνο",
        )
        RegistrationTextField(
            value = state.iban,
            onValueChange = registerViewModel::onIbanChange,
            placeholder = "IBAN",
        )

        SectionTitle(title = "Εταιρεία")
        RegistrationTextField(
            value = state.companyName,
            onValueChange = registerViewModel::onCompanyNameChange,
            placeholder = "Εταιρεία",
        )
        RegistrationTextField(
            value = state.vatNumber,
            onValueChange = registerViewModel::onVatNumberChange,
            placeholder = "Α.Φ.Μ",
        )

        SectionTitle(title = "Διεύθυνση +")
        RegistrationTextField(
            value = state.country,
            onValueChange = registerViewModel::onCountryChange,
            placeholder = "Χώρα (ISO, π.χ. GR) *",
        )
        RegistrationTextField(
            value = state.city,
            onValueChange = registerViewModel::onCityChange,
            placeholder = "Πόλη *",
        )
        RegistrationTextField(
            value = state.street,
            onValueChange = registerViewModel::onStreetChange,
            placeholder = "Οδός και Αριθμός *",
        )
        RegistrationTextField(
            value = state.postalCode,
            onValueChange = registerViewModel::onPostalCodeChange,
            placeholder = "Τ.Κ *",
        )

        SectionTitle(title = "Άλλα στοιχεία")
        RegistrationTextField(
            value = state.email,
            onValueChange = registerViewModel::onEmailChange,
            placeholder = "Email *",
        )
        RegistrationTextField(
            value = state.emailConfirmation,
            onValueChange = registerViewModel::onEmailConfirmationChange,
            placeholder = "Επιβεβαίωση Email *",
        )
        RegistrationTextField(
            value = state.passwd,
            onValueChange = registerViewModel::onPasswdChange,
            placeholder = "Κωδικός *",
            isPasswd = true,
            isPasswdVisible = isPasswdVisible,
            onPasswdVisibilityChange = { isPasswdVisible = !isPasswdVisible },
        )
        RegistrationTextField(
            value = state.passwdConfirmation,
            onValueChange = registerViewModel::onPasswdConfirmationChange,
            placeholder = "Επιβεβαίωση Κωδικού *",
            isPasswd = true,
            isPasswdVisible = isPasswdConfirmationVisible,
            onPasswdVisibilityChange = {
                isPasswdConfirmationVisible = !isPasswdConfirmationVisible
            },
        )

        ConsentOption(
            checked = state.customerDataPrivacyAccepted,
            onCheckedChange = registerViewModel::onCustomerDataPrivacyAcceptedChange,
            title = "Προστασία δεδομένων πελάτη",
            description = "Τα προσωπικά δεδομένα που παρέχετε χρησιμοποιούνται για την απάντηση " +
                "σε αιτήματα, την επεξεργασία παραγγελιών ή την παροχή πρόσβασης σε συγκεκριμένες " +
                "πληροφορίες. Έχετε το δικαίωμα να αλλάξετε και να διαγράψετε όλα τα προσωπικά " +
                "σας δεδομένα που βρίσκονται στη σελίδα \"Ο λογαριασμός μου\".",
            required = true,
        )
        ConsentOption(
            checked = state.newsletterOptIn,
            onCheckedChange = registerViewModel::onNewsletterOptInChange,
            title = "Εγγραφείτε στο ενημερωτικό δελτίο μας",
            description = "Μπορείτε να διακόψετε τη συνδρομή οποιαδήποτε στιγμή. " +
                "Για αυτόν τον σκοπό, παρακαλούμε βρείτε τα στοιχεία επικοινωνίας μας " +
                "στην νομική ειδοποίηση.",
        )
        ConsentOption(
            checked = state.termsAndPrivacyAccepted,
            onCheckedChange = registerViewModel::onTermsAndPrivacyAcceptedChange,
            title = "Αποδέχομαι τους όρους και την πολιτική απορρήτου",
            required = true,
        )

        Button(
            onClick = registerViewModel::onSubmit,
            enabled = state.status !is RegisterStatus.Loading,
            modifier = Modifier
                .align(Alignment.CenterHorizontally)
                .padding(top = 8.dp),
            colors = ButtonDefaults.buttonColors(
                containerColor = MaterialTheme.colorScheme.primary.copy(alpha = 0.15f),
                contentColor = MaterialTheme.colorScheme.primary,
                disabledContainerColor = MaterialTheme.colorScheme.surfaceVariant,
            ),
            shape = RoundedCornerShape(12.dp),
        ) {
            Text(text = "Αποθήκευση")
        }
        when (val status = state.status) {
            is RegisterStatus.Loading -> {
                Text(
                    text = "Η αίτηση αποστέλλεται...",
                    style = MaterialTheme.typography.bodySmall,
                )
            }
            is RegisterStatus.Success -> {
                Text(
                    text = status.message,
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.primary,
                )
            }
            is RegisterStatus.Error -> {
                Text(
                    text = status.message,
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.error,
                )
            }
            RegisterStatus.Idle -> Unit
        }

    }
}

@Composable
private fun SectionTitle(title: String) {
    Text(
        text = title,
        style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.SemiBold),
    )
}

@Composable
private fun RegistrationTextField(
    value: String,
    onValueChange: (String) -> Unit,
    placeholder: String,
    isPasswd: Boolean = false,
    isPasswdVisible: Boolean = false,
    onPasswdVisibilityChange: (() -> Unit)? = null,
) {
    TextField(
        value = value,
        onValueChange = onValueChange,
        placeholder = {
            Text(
                text = placeholder,
                style = MaterialTheme.typography.bodyMedium,
            )
        },
        modifier = Modifier.fillMaxWidth(),
        textStyle = MaterialTheme.typography.bodyMedium,
        shape = RoundedCornerShape(10.dp),
        visualTransformation = if (isPasswd && !isPasswdVisible) {
            PasswordVisualTransformation()
        } else {
            VisualTransformation.None
        },
        trailingIcon = if (isPasswd && onPasswdVisibilityChange != null) {
            {
                IconButton(onClick = onPasswdVisibilityChange) {
                    Icon(
                        imageVector = if (isPasswdVisible) {
                            Icons.Filled.VisibilityOff
                        } else {
                            Icons.Filled.Visibility
                        },
                        contentDescription = null,
                    )
                }
            }
        } else {
            null
        },
        colors = TextFieldDefaults.colors(
            focusedContainerColor = MaterialTheme.colorScheme.surfaceVariant,
            unfocusedContainerColor = MaterialTheme.colorScheme.surfaceVariant,
            disabledContainerColor = MaterialTheme.colorScheme.surfaceVariant,
            focusedIndicatorColor = MaterialTheme.colorScheme.surfaceVariant,
            unfocusedIndicatorColor = MaterialTheme.colorScheme.surfaceVariant,
            disabledIndicatorColor = MaterialTheme.colorScheme.surfaceVariant,
            focusedTextColor = MaterialTheme.colorScheme.onSurface,
            unfocusedTextColor = MaterialTheme.colorScheme.onSurface,
            focusedPlaceholderColor = MaterialTheme.colorScheme.onSurfaceVariant,
            unfocusedPlaceholderColor = MaterialTheme.colorScheme.onSurfaceVariant,
        ),
    )
}

@Composable
private fun SocialTitleOption(
    label: String,
    selected: Boolean,
    onSelect: () -> Unit,
) {
    Row(
        verticalAlignment = Alignment.CenterVertically,
    ) {
        RadioButton(
            selected = selected,
            onClick = onSelect,
        )
        Text(text = label, style = MaterialTheme.typography.bodyMedium)
    }
}

@Composable
private fun ConsentOption(
    checked: Boolean,
    onCheckedChange: (Boolean) -> Unit,
    title: String,
    description: String? = null,
    required: Boolean = false,
) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        verticalAlignment = Alignment.Top,
    ) {
        Checkbox(
            checked = checked,
            onCheckedChange = onCheckedChange,
        )
        Column(
            modifier = Modifier.padding(top = 4.dp),
            verticalArrangement = Arrangement.spacedBy(4.dp),
        ) {
            Text(
                text = if (required) "$title *" else title,
                style = MaterialTheme.typography.bodyMedium,
            )
            if (!description.isNullOrBlank()) {
                Text(
                    text = description,
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                )
            }
        }
    }
}
