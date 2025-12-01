#!/bin/bash
# ===========================================================
# Script para convertir nombres de tablas y columnas a español
# ===========================================================

INPUT_FILE="pwbnbxqt_ddbbControlHorario.sql"
OUTPUT_FILE="pwbnbxqt_ddbbControlHorario_ESPANOL.sql"

echo "Convirtiendo nombres a español..."
echo "Archivo origen: $INPUT_FILE"
echo "Archivo destino: $OUTPUT_FILE"

# Copiar archivo original
cp "$INPUT_FILE" "$OUTPUT_FILE"

# ===========================================================
# REEMPLAZAR NOMBRES DE TABLAS
# ===========================================================

sed -i 's/`abscontrolhorario`/`ausencias_empleados`/g' "$OUTPUT_FILE"
sed -i 's/`audcontrolhorario`/`auditoria_sistema`/g' "$OUTPUT_FILE"
sed -i 's/`clfcontrolhorario`/`calendario_festivos`/g' "$OUTPUT_FILE"
sed -i 's/`clicontrolhorario`/`clientes`/g' "$OUTPUT_FILE"
sed -i 's/`cmpcontrolhorario`/`empresas`/g' "$OUTPUT_FILE"
sed -i 's/`dptcontrolhorario`/`departamentos`/g' "$OUTPUT_FILE"
sed -i 's/`emlcolacontrolhorario`/`cola_emails`/g' "$OUTPUT_FILE"
sed -i 's/`geocontrolhorario`/`ubicaciones_geograficas`/g' "$OUTPUT_FILE"
sed -i 's/`ntfcontrolhorario`/`notificaciones`/g' "$OUTPUT_FILE"
sed -i 's/`ntfpreferenciascontrolhorario`/`preferencias_notificaciones`/g' "$OUTPUT_FILE"
sed -i 's/`ovtcontrolhorario`/`horas_extras`/g' "$OUTPUT_FILE"
sed -i 's/`prjcontrolhorario`/`proyectos`/g' "$OUTPUT_FILE"
sed -i 's/`schcontrolhorario`/`horarios_trabajo`/g' "$OUTPUT_FILE"
sed -i 's/`schusuariocontrolhorario`/`asignacion_horarios_empleados`/g' "$OUTPUT_FILE"
sed -i 's/`setcontrolhorario`/`configuraciones_sistema`/g' "$OUTPUT_FILE"
sed -i 's/`shfasignacioncontrolhorario`/`asignacion_turnos`/g' "$OUTPUT_FILE"
sed -i 's/`shfintercambiocontrolhorario`/`intercambios_turnos`/g' "$OUTPUT_FILE"
sed -i 's/`shfpatroncontrolhorario`/`patrones_turnos`/g' "$OUTPUT_FILE"
sed -i 's/`tktcontrolhorario`/`tickets_soporte`/g' "$OUTPUT_FILE"
sed -i 's/`tktrespuestascontrolhorario`/`respuestas_tickets`/g' "$OUTPUT_FILE"
sed -i 's/`tmrcontrolhorario`/`registros_horarios`/g' "$OUTPUT_FILE"
sed -i 's/`tmrproyectocontrolhorario`/`tiempo_proyectos`/g' "$OUTPUT_FILE"
sed -i 's/`tskcontrolhorario`/`tareas`/g' "$OUTPUT_FILE"
sed -i 's/`usrcontrolhorario`/`empleados`/g' "$OUTPUT_FILE"
sed -i 's/`wbhcontrolhorario`/`webhooks`/g' "$OUTPUT_FILE"
sed -i 's/`wbhentregascontrolhorario`/`entregas_webhooks`/g' "$OUTPUT_FILE"

# ===========================================================
# REEMPLAZAR NOMBRES DE COLUMNAS COMUNES
# ===========================================================

# IDs
sed -i 's/`user_id`/`id_empleado`/g' "$OUTPUT_FILE"
sed -i 's/`company_id`/`id_empresa`/g' "$OUTPUT_FILE"
sed -i 's/`department_id`/`id_departamento`/g' "$OUTPUT_FILE"
sed -i 's/`project_id`/`id_proyecto`/g' "$OUTPUT_FILE"
sed -i 's/`client_id`/`id_cliente`/g' "$OUTPUT_FILE"
sed -i 's/`manager_id`/`id_responsable`/g' "$OUTPUT_FILE"
sed -i 's/`schedule_id`/`id_horario`/g' "$OUTPUT_FILE"
sed -i 's/`ticket_id`/`id_ticket`/g' "$OUTPUT_FILE"
sed -i 's/`webhook_id`/`id_webhook`/g' "$OUTPUT_FILE"
sed -i 's/`shift_pattern_id`/`id_patron_turno`/g' "$OUTPUT_FILE"
sed -i 's/`time_entry_id`/`id_registro_tiempo`/g' "$OUTPUT_FILE"

# Campos comunes
sed -i 's/`email`/`correo_electronico`/g' "$OUTPUT_FILE"
sed -i 's/`password`/`contrasena_hash`/g' "$OUTPUT_FILE"
sed -i 's/`first_name`/`nombre`/g' "$OUTPUT_FILE"
sed -i 's/`last_name`/`apellidos`/g' "$OUTPUT_FILE"
sed -i 's/`phone`/`telefono`/g' "$OUTPUT_FILE"
sed -i 's/`address`/`direccion`/g' "$OUTPUT_FILE"
sed -i 's/`avatar`/`foto_perfil`/g' "$OUTPUT_FILE"
sed -i 's/`role`/`tipo_usuario`/g' "$OUTPUT_FILE"

# Fechas y horas
sed -i 's/`created_at`/`fecha_creacion`/g' "$OUTPUT_FILE"
sed -i 's/`updated_at`/`fecha_actualizacion`/g' "$OUTPUT_FILE"
sed -i 's/`created_by`/`creado_por`/g' "$OUTPUT_FILE"
sed -i 's/`start_date`/`fecha_inicio`/g' "$OUTPUT_FILE"
sed -i 's/`end_date`/`fecha_fin`/g' "$OUTPUT_FILE"
sed -i 's/`hire_date`/`fecha_contratacion`/g' "$OUTPUT_FILE"
sed -i 's/`last_login`/`ultimo_acceso`/g' "$OUTPUT_FILE"
sed -i 's/`approved_at`/`fecha_aprobacion`/g' "$OUTPUT_FILE"
sed -i 's/`resolved_at`/`fecha_resolucion`/g' "$OUTPUT_FILE"
sed -i 's/`completed_at`/`fecha_completado`/g' "$OUTPUT_FILE"
sed -i 's/`delivered_at`/`fecha_entrega`/g' "$OUTPUT_FILE"
sed -i 's/`sent_at`/`fecha_envio`/g' "$OUTPUT_FILE"
sed -i 's/`read_at`/`fecha_lectura`/g' "$OUTPUT_FILE"
sed -i 's/`paid_date`/`fecha_pago`/g' "$OUTPUT_FILE"
sed -i 's/`due_date`/`fecha_vencimiento`/g' "$OUTPUT_FILE"

# Check in/out
sed -i 's/`check_in`/`hora_entrada`/g' "$OUTPUT_FILE"
sed -i 's/`check_out`/`hora_salida`/g' "$OUTPUT_FILE"
sed -i 's/`check_in_latitude`/`latitud_entrada`/g' "$OUTPUT_FILE"
sed -i 's/`check_in_longitude`/`longitud_entrada`/g' "$OUTPUT_FILE"
sed -i 's/`check_out_latitude`/`latitud_salida`/g' "$OUTPUT_FILE"
sed -i 's/`check_out_longitude`/`longitud_salida`/g' "$OUTPUT_FILE"
sed -i 's/`check_in_ip`/`ip_entrada`/g' "$OUTPUT_FILE"
sed -i 's/`check_out_ip`/`ip_salida`/g' "$OUTPUT_FILE"

# Otros campos descriptivos
sed -i 's/`name`/`nombre`/g' "$OUTPUT_FILE"
sed -i 's/`description`/`descripcion`/g' "$OUTPUT_FILE"
sed -i 's/`type`/`tipo`/g' "$OUTPUT_FILE"
sed -i 's/`status`/`estado`/g' "$OUTPUT_FILE"
sed -i 's/`priority`/`prioridad`/g' "$OUTPUT_FILE"
sed -i 's/`notes`/`notas`/g' "$OUTPUT_FILE"
sed -i 's/`reason`/`motivo`/g' "$OUTPUT_FILE"
sed -i 's/`message`/`mensaje`/g' "$OUTPUT_FILE"
sed -i 's/`title`/`titulo`/g' "$OUTPUT_FILE"
sed -i 's/`subject`/`asunto`/g' "$OUTPUT_FILE"

# Booleanos
sed -i 's/`is_active`/`esta_activo`/g' "$OUTPUT_FILE"
sed -i 's/`is_read`/`esta_leido`/g' "$OUTPUT_FILE"
sed -i 's/`is_paid`/`esta_pagado`/g' "$OUTPUT_FILE"
sed -i 's/`is_billable`/`es_facturable`/g' "$OUTPUT_FILE"
sed -i 's/`is_recurring`/`es_recurrente`/g' "$OUTPUT_FILE"
sed -i 's/`is_working_day`/`es_dia_laboral`/g' "$OUTPUT_FILE"

# Numéricos y medidas
sed -i 's/`total_hours`/`horas_totales`/g' "$OUTPUT_FILE"
sed -i 's/`total_days`/`dias_totales`/g' "$OUTPUT_FILE"
sed -i 's/`break_minutes`/`minutos_descanso`/g' "$OUTPUT_FILE"
sed -i 's/`hourly_rate`/`tarifa_hora`/g' "$OUTPUT_FILE"
sed -i 's/`weekly_hours`/`horas_semanales`/g' "$OUTPUT_FILE"
sed -i 's/`estimated_hours`/`horas_estimadas`/g' "$OUTPUT_FILE"
sed -i 's/`actual_hours`/`horas_reales`/g' "$OUTPUT_FILE"

# Aprobaciones
sed -i 's/`approved_by`/`aprobado_por`/g' "$OUTPUT_FILE"
sed -i 's/`assigned_to`/`asignado_a`/g' "$OUTPUT_FILE"
sed -i 's/`rejection_reason`/`motivo_rechazo`/g' "$OUTPUT_FILE"

# Otros
sed -i 's/`employee_code`/`codigo_empleado`/g' "$OUTPUT_FILE"
sed -i 's/`contact_person`/`persona_contacto`/g' "$OUTPUT_FILE"
sed -i 's/`website`/`sitio_web`/g' "$OUTPUT_FILE"
sed -i 's/`logo`/`logo_url`/g' "$OUTPUT_FILE"
sed -i 's/`config`/`configuracion`/g' "$OUTPUT_FILE"
sed -i 's/`latitude`/`latitud`/g' "$OUTPUT_FILE"
sed -i 's/`longitude`/`longitud`/g' "$OUTPUT_FILE"
sed -i 's/`date`/`fecha`/g' "$OUTPUT_FILE"
sed -i 's/`hours`/`horas`/g' "$OUTPUT_FILE"
sed -i 's/`color`/`color`/g' "$OUTPUT_FILE"
sed -i 's/`budget`/`presupuesto`/g' "$OUTPUT_FILE"

echo ""
echo "✅ Conversión completada!"
echo "📁 Archivo generado: $OUTPUT_FILE"
echo ""
echo "Puedes importarlo con:"
echo "mysql -u root -p < $OUTPUT_FILE"
