#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script para convertir nombres de tablas y columnas a español descriptivo
Convierte: pwbnbxqt_ddbbControlHorario.sql → pwbnbxqt_ddbbControlHorario_ESPANOL.sql
"""

import os
import sys

def main():
    input_file = "pwbnbxqt_ddbbControlHorario.sql"
    output_file = "pwbnbxqt_ddbbControlHorario_ESPANOL.sql"

    print("=" * 60)
    print("Convertidor de Nombres SQL a Español")
    print("=" * 60)
    print(f"📄 Archivo origen: {input_file}")
    print(f"📄 Archivo destino: {output_file}")
    print()

    # Verificar que existe el archivo
    if not os.path.exists(input_file):
        print(f"❌ Error: No se encuentra el archivo {input_file}")
        sys.exit(1)

    # Leer el archivo
    print("📖 Leyendo archivo original...")
    with open(input_file, 'r', encoding='utf-8') as f:
        content = f.read()

    print(f"✅ Archivo leído: {len(content)} caracteres")
    print()

    # ===========================================================
    # REEMPLAZOS DE TABLAS
    # ===========================================================
    print("🔄 Reemplazando nombres de tablas...")

    table_replacements = {
        '`abscontrolhorario`': '`ausencias_empleados`',
        '`audcontrolhorario`': '`auditoria_sistema`',
        '`clfcontrolhorario`': '`calendario_festivos`',
        '`clicontrolhorario`': '`clientes`',
        '`cmpcontrolhorario`': '`empresas`',
        '`dptcontrolhorario`': '`departamentos`',
        '`emlcolacontrolhorario`': '`cola_emails`',
        '`geocontrolhorario`': '`ubicaciones_geograficas`',
        '`ntfcontrolhorario`': '`notificaciones`',
        '`ntfpreferenciascontrolhorario`': '`preferencias_notificaciones`',
        '`ovtcontrolhorario`': '`horas_extras`',
        '`prjcontrolhorario`': '`proyectos`',
        '`schcontrolhorario`': '`horarios_trabajo`',
        '`schusuariocontrolhorario`': '`asignacion_horarios_empleados`',
        '`setcontrolhorario`': '`configuraciones_sistema`',
        '`shfasignacioncontrolhorario`': '`asignacion_turnos`',
        '`shfintercambiocontrolhorario`': '`intercambios_turnos`',
        '`shfpatroncontrolhorario`': '`patrones_turnos`',
        '`tktcontrolhorario`': '`tickets_soporte`',
        '`tktrespuestascontrolhorario`': '`respuestas_tickets`',
        '`tmrcontrolhorario`': '`registros_horarios`',
        '`tmrproyectocontrolhorario`': '`tiempo_proyectos`',
        '`tskcontrolhorario`': '`tareas`',
        '`usrcontrolhorario`': '`empleados`',
        '`wbhcontrolhorario`': '`webhooks`',
        '`wbhentregascontrolhorario`': '`entregas_webhooks`',
    }

    for old, new in table_replacements.items():
        content = content.replace(old, new)

    print(f"   ✅ {len(table_replacements)} tablas renombradas")
    print()

    # ===========================================================
    # REEMPLAZOS DE COLUMNAS
    # ===========================================================
    print("🔄 Reemplazando nombres de columnas...")

    column_replacements = {
        # IDs
        '`user_id`': '`id_empleado`',
        '`company_id`': '`id_empresa`',
        '`department_id`': '`id_departamento`',
        '`project_id`': '`id_proyecto`',
        '`client_id`': '`id_cliente`',
        '`manager_id`': '`id_responsable`',
        '`schedule_id`': '`id_horario`',
        '`ticket_id`': '`id_ticket`',
        '`webhook_id`': '`id_webhook`',
        '`shift_pattern_id`': '`id_patron_turno`',
        '`time_entry_id`': '`id_registro_tiempo`',

        # Campos personales
        '`email`': '`correo_electronico`',
        '`password`': '`contrasena_hash`',
        '`first_name`': '`nombre`',
        '`last_name`': '`apellidos`',
        '`phone`': '`telefono`',
        '`address`': '`direccion`',
        '`avatar`': '`foto_perfil`',
        '`role`': '`tipo_usuario`',

        # Fechas y timestamps
        '`created_at`': '`fecha_creacion`',
        '`updated_at`': '`fecha_actualizacion`',
        '`created_by`': '`creado_por`',
        '`start_date`': '`fecha_inicio`',
        '`end_date`': '`fecha_fin`',
        '`hire_date`': '`fecha_contratacion`',
        '`last_login`': '`ultimo_acceso`',
        '`approved_at`': '`fecha_aprobacion`',
        '`resolved_at`': '`fecha_resolucion`',
        '`completed_at`': '`fecha_completado`',
        '`delivered_at`': '`fecha_entrega`',
        '`sent_at`': '`fecha_envio`',
        '`read_at`': '`fecha_lectura`',
        '`paid_date`': '`fecha_pago`',
        '`due_date`': '`fecha_vencimiento`',

        # Check in/out
        '`check_in`': '`hora_entrada`',
        '`check_out`': '`hora_salida`',
        '`check_in_latitude`': '`latitud_entrada`',
        '`check_in_longitude`': '`longitud_entrada`',
        '`check_out_latitude`': '`latitud_salida`',
        '`check_out_longitude`': '`longitud_salida`',
        '`check_in_ip`': '`ip_entrada`',
        '`check_out_ip`': '`ip_salida`',

        # Campos descriptivos generales
        '`name`': '`nombre`',
        '`description`': '`descripcion`',
        '`type`': '`tipo`',
        '`status`': '`estado`',
        '`priority`': '`prioridad`',
        '`notes`': '`notas`',
        '`reason`': '`motivo`',
        '`message`': '`mensaje`',
        '`title`': '`titulo`',
        '`subject`': '`asunto`',
        '`category`': '`categoria`',

        # Booleanos (is_*)
        '`is_active`': '`esta_activo`',
        '`is_read`': '`esta_leido`',
        '`is_paid`': '`esta_pagado`',
        '`is_billable`': '`es_facturable`',
        '`is_recurring`': '`es_recurrente`',
        '`is_working_day`': '`es_dia_laboral`',
        '`is_internal`': '`es_interno`',

        # Numéricos y medidas
        '`total_hours`': '`horas_totales`',
        '`total_days`': '`dias_totales`',
        '`total_amount`': '`monto_total`',
        '`break_minutes`': '`minutos_descanso`',
        '`hourly_rate`': '`tarifa_hora`',
        '`weekly_hours`': '`horas_semanales`',
        '`estimated_hours`': '`horas_estimadas`',
        '`actual_hours`': '`horas_reales`',
        '`rate_per_hour`': '`tarifa_por_hora`',
        '`radius_meters`': '`radio_metros`',

        # Aprobaciones y asignaciones
        '`approved_by`': '`aprobado_por`',
        '`assigned_to`': '`asignado_a`',
        '`rejection_reason`': '`motivo_rechazo`',
        '`requester_id`': '`id_solicitante`',
        '`target_id`': '`id_objetivo`',

        # Otros campos específicos
        '`employee_code`': '`codigo_empleado`',
        '`contact_person`': '`persona_contacto`',
        '`website`': '`sitio_web`',
        '`logo`': '`logo_url`',
        '`config`': '`configuracion`',
        '`latitude`': '`latitud`',
        '`longitude`': '`longitud`',
        '`date`': '`fecha`',
        '`hours`': '`horas`',
        '`color`': '`color`',
        '`budget`': '`presupuesto`',
        '`action`': '`accion`',
        '`entity_type`': '`tipo_entidad`',
        '`entity_id`': '`id_entidad`',
        '`old_values`': '`valores_antiguos`',
        '`new_values`': '`valores_nuevos`',
        '`ip_address`': '`direccion_ip`',
        '`user_agent`': '`agente_usuario`',
        '`link`': '`enlace`',
        '`action_url`': '`url_accion`',
        '`metadata`': '`metadatos`',
        '`color_code`': '`codigo_color`',
        '`order_index`': '`orden`',
        '`setting_key`': '`clave_configuracion`',
        '`setting_value`': '`valor_configuracion`',
        '`secret`': '`secreto`',
        '`url`': '`url`',
        '`events`': '`eventos`',
        '`last_triggered_at`': '`ultima_ejecucion`',
        '`event_type`': '`tipo_evento`',
        '`payload`': '`datos`',
        '`status_code`': '`codigo_estado`',
        '`response_body`': '`respuesta`',
        '`success`': '`exitoso`',
        '`error_message`': '`mensaje_error`',
        '`duration_ms`': '`duracion_ms`',
        '`template`': '`plantilla`',
        '`recipients`': '`destinatarios`',
        '`data`': '`datos`',
        '`attempts`': '`intentos`',
        '`max_attempts`': '`max_intentos`',
        '`multiplier`': '`multiplicador`',
        '`overtime_type`': '`tipo_hora_extra`',
        '`requester_shift_id`': '`id_turno_solicitante`',
        '`target_shift_id`': '`id_turno_objetivo`',
        '`rotation_type`': '`tipo_rotacion`',
        '`rotation_days`': '`dias_rotacion`',
        '`work_days`': '`dias_trabajo`',
        '`rest_days`': '`dias_descanso`',
    }

    for old, new in column_replacements.items():
        content = content.replace(old, new)

    print(f"   ✅ {len(column_replacements)} columnas renombradas")
    print()

    # ===========================================================
    # REEMPLAZOS DE DÍAS DE LA SEMANA
    # ===========================================================
    print("🔄 Reemplazando nombres de días de la semana...")

    day_replacements = {
        '`monday_start`': '`lunes_inicio`',
        '`monday_end`': '`lunes_fin`',
        '`tuesday_start`': '`martes_inicio`',
        '`tuesday_end`': '`martes_fin`',
        '`wednesday_start`': '`miercoles_inicio`',
        '`wednesday_end`': '`miercoles_fin`',
        '`thursday_start`': '`jueves_inicio`',
        '`thursday_end`': '`jueves_fin`',
        '`friday_start`': '`viernes_inicio`',
        '`friday_end`': '`viernes_fin`',
        '`saturday_start`': '`sabado_inicio`',
        '`saturday_end`': '`sabado_fin`',
        '`sunday_start`': '`domingo_inicio`',
        '`sunday_end`': '`domingo_fin`',
    }

    for old, new in day_replacements.items():
        content = content.replace(old, new)

    print(f"   ✅ {len(day_replacements)} días de la semana renombrados")
    print()

    # ===========================================================
    # GUARDAR ARCHIVO
    # ===========================================================
    print("💾 Guardando archivo convertido...")

    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(content)

    file_size = os.path.getsize(output_file)
    file_size_kb = file_size / 1024

    print(f"✅ Archivo guardado: {output_file}")
    print(f"📊 Tamaño: {file_size_kb:.2f} KB")
    print()

    # ===========================================================
    # RESUMEN
    # ===========================================================
    print("=" * 60)
    print("✅ CONVERSIÓN COMPLETADA EXITOSAMENTE")
    print("=" * 60)
    print()
    print(f"Total de reemplazos:")
    print(f"  • {len(table_replacements)} tablas")
    print(f"  • {len(column_replacements)} columnas")
    print(f"  • {len(day_replacements)} días de la semana")
    print(f"  • Total: {len(table_replacements) + len(column_replacements) + len(day_replacements)} cambios")
    print()
    print("📋 Para importar el archivo:")
    print(f"   mysql -u root -p < {output_file}")
    print()
    print("⚠️  Recuerda hacer un backup antes de importar!")
    print()

if __name__ == '__main__':
    try:
        main()
    except Exception as e:
        print(f"\n❌ Error: {e}")
        sys.exit(1)
